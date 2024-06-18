interface Question {
  type: "open" | "multiple" | string;
  pregunta: string;
  correcta?: string;
  señuelo1?: string;
  señuelo2?: string;
  señuelo3?: string;
  id: string;
  image: Buffer | string | null | { data: [number]; type: string };
  _id?: string;
  puntos: number;
  openAnswers: string[];
}
export default Question;
