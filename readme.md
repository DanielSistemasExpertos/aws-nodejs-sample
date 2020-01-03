# Pasos para ejecutar el proyecto

### Instalación

```sh
$ cd nombre_nombre_proyecto
$ npm install
$ npm i nodemon -D
```

### base de datos
src/database/epicrisis_hospitalizados.sql

### Levantar servidor
```sh
$ npm run dev
```

### usar rutas
```sh
- muestra los epicrisis_hospitalizados verificados por Dr
$ localhost:3000/getEpicrisisHospitalizados

- muestra los epicrisis_hospitalizados verificados por Dr y si han sido analizados con comprehend Medicadal las Entities y responseUnmappedAttributes
$ localhost:3000/getEpicrisisHospitalizadosByHospId/{hosp_id}

- muestra los epicrisis_hospitalizados verificados por Dr, en caso de que no esten analizados con comprehend se usa el metodo comprehendmedical.detectEntitiesV2 para analizar el texto de epicrisis_resumen
$ localhost:3000/creaEHdetectEntities/{hosp_id}
```

