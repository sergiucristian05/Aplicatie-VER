import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { trimiteEmailNotificare } from "../utils/notificare";
import dayjs from "dayjs";

export default function Home() {
  const [marca, setMarca] = useState("");
  const [numar, setNumar] = useState("");
  const [itp, setItp] = useState("");
  const [rca, setRca] = useState("");
  const [rovinieta, setRovinieta] = useState("");
  const [masini, setMasini] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "masini"), (snapshot) => {
      const masiniFirebase = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMasini(masiniFirebase);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const verificaExpirari = async () => {
      const snapshot = await getDocs(collection(db, "masini"));
      snapshot.forEach(async (docMasina) => {
        const data = docMasina.data();
        const id = docMasina.id;
        const expirari = [];

        const documente = [
          { tip: "ITP", data: data.itp },
          { tip: "RCA", data: data.rca },
          { tip: "Rovinietă", data: data.rovinieta },
        ];

        for (const docItem of documente) {
          const dataExp = dayjs(docItem.data);
          const diferenta = dataExp.diff(dayjs(), "day");

          if (diferenta <= 10) {
            const idNotificare = `${id}_${docItem.tip}`;
            const docRef = doc(db, "notificari", idNotificare);
            const notificareExistenta = await getDoc(docRef);

            if (!notificareExistenta.exists()) {
              expirari.push(`${docItem.tip} - ${dataExp.format("DD-MM-YYYY")}`);

              await setDoc(docRef, {
                masinaId: id,
                tip: docItem.tip,
                dataExpirare: dataExp.toISOString(),
                trimisLa: new Date().toISOString(),
              });
            }
          }
        }

        if (expirari.length > 0) {
          trimiteEmailNotificare({
            marca: data.marca,
            numar: data.numar,
            expirari: expirari.join(", "),
          });
        }
      });
    };

    verificaExpirari();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!marca || !numar || !itp || !rca || !rovinieta) return;

    try {
      if (editId) {
        await updateDoc(doc(db, "masini", editId), {
          marca,
          numar,
          itp,
          rca,
          rovinieta,
        });
        setEditId(null);
      } else {
        await addDoc(collection(db, "masini"), {
          marca,
          numar,
          itp,
          rca,
          rovinieta,
        });
      }

      setMarca("");
      setNumar("");
      setItp("");
      setRca("");
      setRovinieta("");
    } catch (error) {
      console.error("Eroare la adăugare/editare:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "masini", id));
    } catch (error) {
      console.error("Eroare la ștergere:", error);
    }
  };

  const handleEdit = (masina) => {
    setEditId(masina.id);
    setMarca(masina.marca);
    setNumar(masina.numar);
    setItp(masina.itp);
    setRca(masina.rca);
    setRovinieta(masina.rovinieta);
  };

  return (
  <div className="min-h-screen flex flex-col items-center px-4 py-10 bg-white">
    <h1 className="text-2xl font-bold mb-6 text-center">Flota VERITAS</h1>

    <form
      onSubmit={handleSubmit}
      className="grid gap-4 mb-6 w-full sm:max-w-md"
    >
      <input
        type="text"
        placeholder="Marcă"
        value={marca}
        onChange={(e) => setMarca(e.target.value)}
        className="p-2 border border-gray-300 rounded"
      />
      <input
        type="text"
        placeholder="Număr înmatriculare"
        value={numar}
        onChange={(e) => setNumar(e.target.value)}
        className="p-2 border border-gray-300 rounded"
      />
      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Data expirare ITP</span>
        <input
          type="date"
          value={itp}
          onChange={(e) => setItp(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </label>
      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Data expirare RCA</span>
        <input
          type="date"
          value={rca}
          onChange={(e) => setRca(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </label>
      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Data expirare Rovinietă</span>
        <input
          type="date"
          value={rovinieta}
          onChange={(e) => setRovinieta(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </label>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {editId ? "Salvează modificările" : "Adaugă mașină"}
      </button>
    </form>

    <div className="w-full overflow-x-auto sm:max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">Mașini în flotă</h2>
      <table className="w-full table-auto border-collapse border border-gray-200 text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border border-gray-300">Marcă</th>
            <th className="p-2 border border-gray-300">Număr</th>
            <th className="p-2 border border-gray-300">ITP</th>
            <th className="p-2 border border-gray-300">RCA</th>
            <th className="p-2 border border-gray-300">Rovinietă</th>
            <th className="p-2 border border-gray-300">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {masini.map((masina) => (
            <tr key={masina.id}>
              <td className="p-2 border border-gray-300">{masina.marca}</td>
              <td className="p-2 border border-gray-300">{masina.numar}</td>
              <td className="p-2 border border-gray-300">{masina.itp}</td>
              <td className="p-2 border border-gray-300">{masina.rca}</td>
              <td className="p-2 border border-gray-300">{masina.rovinieta}</td>
              <td className="p-2 border border-gray-300 text-center space-x-2">
                <button
                  onClick={() => handleEdit(masina)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Editează
                </button>
                <button
                  onClick={() => handleDelete(masina.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Șterge
                </button>
              </td>
            </tr>
          ))}
          {masini.length === 0 && (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                Nicio mașină adăugată.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}