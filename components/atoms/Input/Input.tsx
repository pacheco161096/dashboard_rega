import { FC } from "react";

export interface InputProps {
  checked?: boolean;
  name: string;
  required: boolean;
  placeHolder: string;
  type: string;
  value?: string;
  label?: string;
  isEdited?: boolean;
  defaultValue?: string;
  size?: string;
  errorMessageEmpty?: string;
  funcion: (value: string, name: string) => void;
}

export const Input: FC<InputProps> = ({
  checked,
  name,
  funcion,
  placeHolder,
  required,
  type,
  value,
  isEdited = false,
  defaultValue
}) => {
  const isCheckbox = type === "checkbox";

  return (
    <div className={isCheckbox ? "flex items-center" : "inputContainer relative"}>
      <input
        type={type}
        className={
          isCheckbox
            ? ""
            : "peer h-12 w-full rounded-lg ring-1 px-2 ring-gray-300 focus:ring-blue-600 focus:outline-none focus:border-blue-600"
        }
        name={name}
        placeholder={placeHolder}
        required={required}
        value={value}
        onChange={(e) => funcion(name,e.target.value)}
        disabled={isEdited}
        checked={isCheckbox ? checked : undefined}
        defaultValue={defaultValue}
      />
      <label
        htmlFor={name}
        className={
          isCheckbox
            ? "ml-2"
            : "absolute cursor-text left-0 -top-3 text-sm text-gray-500 mx-1 px-1 z-10 bg-[#ffffff]"
        }
      >
        {name}
      </label>
    </div>
  );
};