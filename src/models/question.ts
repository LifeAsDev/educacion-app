interface Question {
  type: "open" | "multiple" | string;
  pregunta: string;
  correcta?: string;
  señuelo1?: string;
  señuelo2?: string;
  señuelo3?: string;
  id: string;
  image: string | File | null;
  _id?: string;
}
export default Question;
