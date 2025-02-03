import { FC } from "react";

export interface InputProps {
  key: number;
  nombre: string;
  requerido: boolean;
  placeHolder?: string;
  type: string;
  valor?: string;
  label?: string;
  isEdited?: boolean;
  defaultValue?: string;
  size?: string;
  errorMessageEmpty?: string;
  funcion: () => void;
}

export const Input: FC<InputProps> = (props) => {
  const { nombre, funcion, placeHolder, requerido, type, valor, isEdited = false } = props;

  return (
    <div className="inputContainer relative">
      <input
        type={type}
        className="peer h-12 w-full rounded-lg  ring-1 px-2 ring-gray-300 focus:ring-blue-600 focus:outline-none focus:border-blue-600"
        name={nombre}
        placeholder={placeHolder}
        required={requerido}
        value={valor}
        onChange={(e) => funcion(nombre, e.target.value)}
        disabled={isEdited}
      />
      <label
        htmlFor={nombre}
        className="absolute cursor-text left-0 -top-3 text-sm text-gray-400 mx-1 px-1 peer-placeholder-shown:-z-10 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#6f6d74] peer-placeholder-shown:top-3 peer-focus:z-10 peer-focus:-top-3 bg-[#ffffff]"
      >
        {nombre}
      </label>
    </div>
  );
};
