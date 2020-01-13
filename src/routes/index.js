const { Router } = require('express');
const router = Router();

// incluimos las funciones del controlador
const { getEpicrisisHospitalizados, getEpicrisisHospitalizadosByHospId, creaEHdetectEntities } = require('../controllers/index.controller');

router.get('/', (req, res) => {
    res.render('index');
});

// al dar click en el boton buscar cuenta corrriente muestra el formulario para buscar cuenta corriente asociada al medico que atendio el paciente
router.get('/epicrisis/', (req, res) => {
    cuentaCC = req;
    console.log(cuentaCC);
    res.render('epicrisis/buscaCC');
});

// al dar click en el boton analizar con comprehend medical, muestra el formulario para buscar cuenta corriente asociada al medico que atendio el paciente y analizar el epicrisis con comprehend medical
router.get('/epicrisis/creaComprehendMedical', (req, res) => {
    cuentaCC = req;
    console.log(cuentaCC);
    res.render('epicrisis/creaComprehendMedical');
});

//metodo para obtener los 100 primeros datos de epicrisis_hospitalizados
router.get('/getEpicrisisHospitalizados', getEpicrisisHospitalizados);

// metodo para obtener los datos de epicrisis_hospitalizados por hosp_id
router.get('/getEpicrisisHospitalizadosByHospId/:hosp_id', getEpicrisisHospitalizadosByHospId);

//ruta para obtener datos de los pacientes en la tabla epicrisis_hospitalizados, analizarlos y insertarlos
router.get('/creaEHdetectEntities/:hosp_id', creaEHdetectEntities);



module.exports = router;