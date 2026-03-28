import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { BARBERS, BUSINESS_HOURS } from "../constants";
import type { Appointment, Barber, BusinessHours, Service } from "../types";

type ServiceDoc = Partial<Omit<Service, "id">>;

/**
 * Converte um valor desconhecido em numero.
 * Aceita number valido ou string numerica (com "," ou ".").
 * Se nao for possivel converter, retorna o fallback.
 */
const toNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const normalizePhone = (value: string) => value.replace(/\D/g, '').trim();

/**
 * Busca a lista de servicos no Firestore e normaliza os campos
 * para garantir valores padrao usados na UI.
 */
export async function fetchServices(): Promise<Service[]> {
  const snap = await getDocs(collection(db, "services"));

  return snap.docs.map((doc) => {
    const data = doc.data() as ServiceDoc;
    return {
      id: doc.id,
      name: data.name ?? "Servico sem nome",
      price: toNumber(data.price, 0),
      duration:
        typeof data.duration === "string"
          ? data.duration
          : `${toNumber(data.duration, 0)} min`,
    };
  });
}

type BarberDoc = Omit<Barber, "id">;

export async function fetchBarbers(): Promise<Barber[]> {
  try {
    const snap = await getDocs(collection(db, "barbers"));
    if (snap.empty) {
      return BARBERS;
    }
    return snap.docs.map((docSnap) => {
      const data = docSnap.data() as Partial<BarberDoc>;
      return {
        id: docSnap.id,
        name: data.name ?? "Barbeiro",
        avatar: data.avatar ?? "",
        specialty: data.specialty ?? "",
      };
    });
  } catch {
    return BARBERS;
  }
}

type AppointmentDoc = Omit<Appointment, "id">;

/**
 * Normaliza um agendamento removendo campos ausentes e aplicando defaults.
 * Isso evita erros na interface quando o documento estiver incompleto.
 */
const normalizeAppointment = (id: string, data: AppointmentDoc): Appointment => ({
  id,
  clientId: data.clientId ?? "",
  clientName: data.clientName ?? "Cliente",
  clientPhone: data.clientPhone ?? "",
  serviceId: data.serviceId ?? "",
  barberId: data.barberId ?? "",
  date: data.date ?? "",
  time: data.time ?? "",
  status: data.status ?? "Reservado",
  notes: data.notes ?? "",
});

/**
 * Busca todos os agendamentos.
 */
export async function fetchAppointments(): Promise<Appointment[]> {
  const snap = await getDocs(collection(db, "appointments"));
  return snap.docs.map((docSnap) =>
    normalizeAppointment(docSnap.id, docSnap.data() as AppointmentDoc)
  );
}

/**
 * Busca agendamentos por data (yyyy-mm-dd).
 */
export async function fetchAppointmentsByDate(
  date: string
): Promise<Appointment[]> {
  const q = query(collection(db, "appointments"), where("date", "==", date));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) =>
    normalizeAppointment(docSnap.id, docSnap.data() as AppointmentDoc)
  );
}

export async function fetchAppointmentsByPhone(
  phone: string
): Promise<Appointment[]> {
  const normalized = normalizePhone(phone);
  if (!normalized) return [];

  const byNormalized = query(
    collection(db, "appointments"),
    where("clientPhoneNormalized", "==", normalized)
  );
  const byRaw = query(
    collection(db, "appointments"),
    where("clientPhone", "==", phone)
  );

  const [snapNormalized, snapRaw] = await Promise.all([
    getDocs(byNormalized),
    getDocs(byRaw),
  ]);

  const map = new Map<string, Appointment>();
  snapNormalized.docs.forEach((docSnap) => {
    map.set(
      docSnap.id,
      normalizeAppointment(docSnap.id, docSnap.data() as AppointmentDoc)
    );
  });
  snapRaw.docs.forEach((docSnap) => {
    map.set(
      docSnap.id,
      normalizeAppointment(docSnap.id, docSnap.data() as AppointmentDoc)
    );
  });

  return Array.from(map.values());
}

/**
 * Busca agendamentos por barbeiro e data.
 */
export async function fetchAppointmentsForBarberDate(
  barberId: string,
  date: string
): Promise<Appointment[]> {
  const q = query(
    collection(db, "appointments"),
    where("barberId", "==", barberId),
    where("date", "==", date)
  );
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) =>
    normalizeAppointment(docSnap.id, docSnap.data() as AppointmentDoc)
  );
}

export function subscribeAppointmentsForBarberDate(
  barberId: string,
  date: string,
  onChange: (appointments: Appointment[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const q = query(
    collection(db, "appointments"),
    where("barberId", "==", barberId),
    where("date", "==", date)
  );
  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((docSnap) =>
        normalizeAppointment(docSnap.id, docSnap.data() as AppointmentDoc)
      );
      onChange(data);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export function subscribeAppointments(
  onChange: (appointments: Appointment[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const q = query(collection(db, "appointments"));
  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((docSnap) =>
        normalizeAppointment(docSnap.id, docSnap.data() as AppointmentDoc)
      );
      onChange(data);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Cria um agendamento e retorna o registro normalizado com o id gerado.
 */
export async function createAppointment(
  data: AppointmentDoc
): Promise<Appointment> {
  const docRef = await addDoc(collection(db, "appointments"), data);
  return normalizeAppointment(docRef.id, data);
}

/**
 * Atualiza apenas o status do agendamento.
 */
export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"]
): Promise<void> {
  await updateDoc(doc(db, "appointments", id), { status });
}

/**
 * Recupera a disponibilidade de um barbeiro.
 * Se nao existir documento, usa os horarios padrao (BUSINESS_HOURS).
 */
export async function fetchBarberAvailability(
  barberId: string
): Promise<BusinessHours> {
  const ref = doc(db, "barber_availability", barberId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return BUSINESS_HOURS;
  }
  const data = snap.data() as Partial<BusinessHours>;
  const rawDays = Array.isArray(data.daysOpen) ? data.daysOpen : [];
  const normalizedDays = rawDays
    .map((d) => (typeof d === "string" ? Number(d) : d))
    .filter((d) => typeof d === "number" && Number.isFinite(d) && d >= 0 && d <= 6);
  const daysOpen =
    normalizedDays.length > 0 ? (normalizedDays as number[]) : BUSINESS_HOURS.daysOpen;
  return {
    open: data.open ?? BUSINESS_HOURS.open,
    close: data.close ?? BUSINESS_HOURS.close,
    lunchStart: data.lunchStart ?? BUSINESS_HOURS.lunchStart,
    lunchEnd: data.lunchEnd ?? BUSINESS_HOURS.lunchEnd,
    daysOpen,
    blockedDates: Array.isArray(data.blockedDates) ? data.blockedDates : [],
    manualBlockedSlots: Array.isArray(data.manualBlockedSlots)
      ? data.manualBlockedSlots
      : [],
  };
}

/**
 * Salva a disponibilidade do barbeiro com merge para preservar campos existentes.
 */
export async function saveBarberAvailability(
  barberId: string,
  availability: BusinessHours
): Promise<void> {
  await setDoc(doc(db, "barber_availability", barberId), availability, {
    merge: true,
  });
}
