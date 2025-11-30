import React, { useState, useEffect } from "react";
import TallerCard from './TallerCard';

const Talleres = () => {
  const [cursos, setCursos] = useState([]); // Estado para almacenar los cursos
  const [error, setError] = useState(null); // Estado para errores

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQI5ThuSAn_aTJqSLWHJzONDeCZkmpbXW1Ow5rwMBeMIc7M5Z6bFN220hh24U_wr3cnzY3-UJjNKjQI/pub?output=csv')
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los datos: " + response.statusText);
        }
        return response.text();
      })
      .then((data) => {
        try {
          const arrayData = csvToArray(data);
          if (arrayData.length === 0) {
            throw new Error("El archivo CSV está vacío o mal formado.");
          }
          setCursos(arrayData); // Almacena los datos en el estado
        } catch (parseError) {
          console.error("Error al parsear los datos:", parseError);
          setError("Error al parsear los datos del CSV.");
        }
      })
      .catch((error) => {
        console.error("Error al cargar los datos:", error);
        setError(error.message); // Guarda el mensaje de error
      });
  }, []);

  // Función que convierte el texto CSV en un array de objetos, manejando celdas con comillas
  function csvToArray(str, delimiter = ",") {
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");

    return rows
      .filter((row) => row.trim() !== "") // Filtra filas vacías
      .map((row) => {
        const values = [];
        let value = '';
        let insideQuotes = false;

        for (let i = 0; i < row.length; i++) {
          const currentChar = row[i];
          const nextChar = row[i + 1];

          if (currentChar === '"' && !insideQuotes) {
            insideQuotes = true;
          } else if (currentChar === '"' && insideQuotes && nextChar === '"') {
            value += currentChar; // Doble comillas dentro de texto: agrega comilla
            i++; // Salta la siguiente comilla
          } else if (currentChar === '"' && insideQuotes) {
            insideQuotes = false;
          } else if (currentChar === delimiter && !insideQuotes) {
            values.push(value.trim());
            value = '';
          } else {
            value += currentChar;
          }
        }
        values.push(value.trim());

        const obj = headers.reduce((acc, header, index) => {
          acc[header.trim()] = values[index] ? values[index] : "";
          return acc;
        }, {});
        return obj;
      });
  }

  // Función para generar la ruta de la imagen basada en el nombre del taller
  const getImageForCourse = (courseName) => {
    // Normalizar el nombre: eliminar tildes, caracteres especiales, espacios y convertir a minúsculas
    const cleanedName = courseName
      .normalize("NFD") // Elimina tildes
      .replace(/[\u0300-\u036f]/g, "") // Quita acentos y diacríticos
      .replace(/[^a-zA-Z0-9]/g, "") // Remueve caracteres especiales
      .toLowerCase(); // Convierte todo a minúsculas
  
    return `/assets/cards/${cleanedName}.jpg`; // Devuelve la ruta final
  };

console.log(cursos)

  return (
    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {error ? (
        <p style={{ color: "red" }}>{error}</p> // Muestra el mensaje de error en la UI
      ) : (
        cursos.map((taller, index) => (
          <TallerCard
            key={index}
            name={taller.name}
            description={taller.description}
            participants={taller.participants}
            image={getImageForCourse(taller.name)} // Genera la ruta dinámica
            duration={taller.duration}
            modality={taller.modality}
          />
        ))
      )}
    </div>
  );
};

export default Talleres;