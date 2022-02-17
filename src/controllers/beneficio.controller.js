import axios from "axios";
import {
    getConnection,
    querys,
    sql
} from "../database/index";

const obtenerConfiguracion = (req, res) => {
    res.json('test');
}

const calcularBeneficio = (req, res) => {

}

const bitacoraBeneficio = (req, res) => {

}

const acumulacionComponenteCentral = async (req, res) => {
    console.log(req.body);
    const {
        id_cliente,
        Monedero,
        Caja,
        Cajero,
        Sucursal,
        Monto,
        TipoMovimiento
    } = req.body;
    let msgProcesoNoTerminado = {
        CodigoEstatus: "",
        Mensaje: ""
    };
    let idMonedero = desencriptarBase64(Monedero);
    let infoMonedero = await obtenerStatusMonedero(idMonedero);
    let statusMonedero = infoMonedero.data.CodigoEstatus;
    let msgMonedero = infoMonedero.data.Mensaje;
    if (statusMonedero !== "00") {
        msgProcesoNoTerminado.CodigoEstatus = CodigoEstatus;
        msgProcesoNoTerminado.Mensaje = msgMonedero;
        res.send(msgProcesoNoTerminado);
    }
    let resMonederoTransDb = await insertarMonederoTransDb(id_cliente, TipoMovimiento, Monto, Monedero);
    console.log(resMonederoTransDb);
    let resMonederoOmniTrans = {};
    let StatusDb = "";
    if (TipoMovimiento === 'I') {
        StatusDb = "ACUMULADO";
        resMonederoOmniTrans = await acumularMonederoOmniTrans();
    } else if (TipoMovimiento === 'D') {
        StatusDb = "REDIMIDO";
        resMonederoOmniTrans = await devolverMonederoOmniTrans();
    } else if (TipoMovimiento === 'R') {
        StatusDb = "REDIMIDO";
        resMonederoOmniTrans = await redimirMonederoOmniTrans();
    }


    //if(resMonederoOmniTrans.Codigoestatus === '00'){
    StatusDb = "ACUMULADO";
    //}
    //    actualizarEstatusMonederoTransDb('ACUMULADO');
}

const desencriptarBase64 = (encrypted) => {
    let buff = Buffer.from(encrypted, 'base64');
    let decoded = buff.toString('utf-8');
    return decoded;
}

const obtenerStatusMonedero = async (idMonedero) => {
    const res = await axios.get(`http://10.0.15.80/apiOmnitransGlobal/api/Omnitrans?MonId=${idMonedero}`);
    return res;
}

const insertarMonederoTransDb = async (id_cliente, TipoMovimiento, Monto, Monedero) => {
    let tipoMov = "";
    if (TipoMovimiento === "D" || TipoMovimiento === "I") {
        tipoMov = "ACUMULADO";
    } else {
        tipoMov = "REDIMIDO";
    }
    let fechaHora = new Date();
    let ultimaTransaccion = await obtenerUltimaTransaccionMonedero(Monedero);
    console.log(ultimaTransaccion);
    let transaccion = null;
    if (ultimaTransaccion.length > 0 || ultimaTransaccion !== undefined) {
        transaccion = parseInt(ultimaTransaccion.Transaccion) + 1;
        transaccion = ("000" + transaccion).slice(-4);
        console.log(transaccion);
    }
    console.log('t', transaccion);
    try {
        const pool = await getConnection();
        await pool
            .request()
            .input("Id_Cliente", sql.VarChar, id_cliente)
            .input("FechaHora", sql.DateTime, fechaHora)
            .input("TipoMov", sql.VarChar, tipoMov)
            .input("Id_Monedero", sql.VarChar, Monedero)
            .input("Monto", sql.Decimal(10, 2), Monto)
            .input("Transaccion", sql.VarChar, transaccion.toString())
            .query(querys.insertMonederoDb);

        const insertado = await pool
            .request()
            .input("Id_Monedero", Monedero)
            .query(querys.obtenerUltimaTransaccion);

        return (insertado.recordset[0]);
    } catch (error) {
        return error.message;
    }
}

const acumularMonederoOmniTrans = async () => {
    let result = await axios.put('http://10.0.15.80/apiOmnitransGlobal/api/Omnitrans', {
        Monedero: idMonedero,
        Caja: caja,
        sucursal: sucursal,
        Cajero: cajero,
        Transaccion: transaccion,
        Monto: Monto,
    });
    return result;
}

const devolverMonederoOmniTrans = async () => {
    let result = await axios.put('http://10.0.15.80/apiOmnitransGlobal/api/Devolucion', {
        Monedero: idMonedero,
        Caja: caja,
        sucursal: sucursal,
        Cajero: cajero,
        Transaccion: transaccion,
        Monto: Monto,
    });
    return result;
}

const redimirMonederoOmniTrans = async () => {
    let result = await axios.put('http://10.0.15.80/apiOmnitransGlobal/api/Omnitrans', {
        Monedero: idMonedero,
        Caja: caja,
        sucursal: sucursal,
        Cajero: cajero,
        Transaccion: transaccion,
        Monto: Monto,
    });
    return result;
}

const obtenerUltimaTransaccionMonedero = async (Monedero) => {
    try {
        const pool = await getConnection();

        const result = await pool
            .request()
            .input("Id_Monedero", Monedero)
            .query(querys.obtenerUltimaTransaccion);
        return result.recordset[0];
    } catch (error) {
        return error.message;
    }
}

module.exports = {
    obtenerConfiguracion,
    calcularBeneficio,
    bitacoraBeneficio,
    acumulacionComponenteCentral
}