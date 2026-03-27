import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { Service } from "../types";

type ServiceDoc = Partial<Omit<Service, "id">>;

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
