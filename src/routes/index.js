const { Router } = require('express');
const router = Router();

// incluimos las funciones del controlador
const { getEpicrisisHospitalizados, getEpicrisisHospitalizadosByHospId, creaEHdetectEntities } = require('../controllers/index.controller');

//metodo para obtener los 100 primeros datos de epicrisis_hospitalizados
router.get('/getEpicrisisHospitalizados', getEpicrisisHospitalizados);

// metodo para obtener los datos de epicrisis_hospitalizados por hosp_id
router.get('/getEpicrisisHospitalizadosByHospId/:hosp_id', getEpicrisisHospitalizadosByHospId);

//ruta para obtener datos de los pacientes en la tabla epicrisis_hospitalizados, analizarlos y insertarlos
router.get('/creaEHdetectEntities/:hosp_id', creaEHdetectEntities);

//metodo para obtener los datos insertados con creaEHdetectEntitiesV2
// router.post('/getDetectEntities', getDetectEntities);


module.exports = router;