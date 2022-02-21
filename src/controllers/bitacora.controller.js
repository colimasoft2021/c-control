import axios from "axios";
import { getConnection, querys, sql } from "../database/index";


const bitacoraBeneficio = async(req, res) => {
    const {
        tipo_cliente,
    } = req.body;
    let resultado = {};
    if(tipo_cliente === "invitado"){
        resultado = await procesoInvitado(res, req.body);
    }else {
        resultado = await procesoRegistrado(res, req.body);
    }
}

const procesoRegistrado = async(res, data) => {
    const {
        Correo,
        Estatus_Movimiento,
        id_cliente,
        Monto_Acum,
        caja
    } = data;
    let CuentaEncriptada = encriptarBase64(datosCliente.NUMEROCUENTA);
    let resultadoRegistro = await registrarClienteBitacoraBeneficio(res, data, CuentaEncriptada);
    if(Estatus_Movimiento === 'PagoPendiente' || Estatus_Movimiento === 'PagoCancelado'){
        return res.send({CodigoEstatus: "03", MensajeEstatus: Estatus_Movimiento});
    }else if(Estatus_Movimiento === 'PendienteAcumulacion'){
        let resultadoAcumulacion = acumularComponenteCentral(id_cliente, Monto_Acum, caja, CuentaEncriptada);
        if(resultadoAcumulacion.eror){
            return res.send({error: resultadoAcumulacion.eror})
        }
        if(resultadoAcumulacion.CodigoEstatus === '00'){
            actualizarBitacoraBeneficio(resultadoRegistro.id);
            return res.send({CodigoEstatus: "04", MensajeEstatus: "Acumulación existosa", MontoAcumulado: Monto_Acum})
        }else{
            return res.send({CodigoEstatus: "05", MensajeEstatus: "Acumulación pendiente", MontoAcumulado: ""})
        }
    }

}

const procesoInvitado = async(res, data) => {
    const { Correo } = data;
    let datosCliente = await obtenerDatosCliente(Correo);
    let CuentaEncriptada = encriptarBase64(datosCliente.NUMEROCUENTA);
    if(!datosCliente.length) {
        return res.send({CodigoEstatus: "01", MensajeEstatus: "Sin monedero CF"});
    }
    if(datosCliente.ESTATUSCUENTA === false){
        return res.send({CodigoEstatus: "02", MensajeEstatus: "Monedero CF inactivo"});
    }
    let resultadoRegistro = await registrarClienteBitacoraBeneficio(res, data, CuentaEncriptada);
}

const obtenerDatosCliente = async (Correo) => {
    try {
        const resultado = await axios.get(`https://cftest.dswenlinea.mx/api/Client?CORREO=${Correo}&CELULAR=`);
        return resultado.data; 
    } catch (error) {
        return res.send({error: error.message});
    }
}

const encriptarBase64 = (dato) => {
    let buff = Buffer.from(dato);  
    let encoded = buff.toString('base64');
    return encoded;
}

const registrarClienteBitacoraBeneficio = async(res, data, CuentaEncriptada) => {
    const {
        tipo_cliente,
        id_cliente,
        Correo,
        Tipo_proceso,
        id_Pedido,
        Monto_Total,
        Fecha_Pago,
        Forma_Pago,
        Monto_Acum,
        Estatus_Movimiento,
        id_monedero,
        caja
    } = data;
    
    try {
        const pool = await getConnection();
        await pool
          .request()
          .input("tipo_cliente", sql.VarChar, tipo_cliente)
          .input("id_clienteapp", sql.Int, id_cliente)
          .input("correo", sql.VarChar, Correo)
          .input("tipo_proceso", sql.VarChar, Tipo_proceso)
          .input("id_pedido", sql.Int, id_Pedido)
          .input("monto_total", sql.Money, Monto_Total)
          .input("fecha_pago", sql.DateTime, Fecha_Pago)
          .input("forma_pago", sql.VarChar, Forma_Pago)
          .input("monto_acum", sql.Money, Monto_Acum)
          .input("estatus_movimiento", sql.VarChar, Estatus_Movimiento)
          .input("id_monedero", sql.VarChar, CuentaEncriptada)
          .input("caja", sql.Int, caja)
          .query(querys.insertClienteBitacoraBeneficio);

        const insertado = await pool
          .request()
          .input("Id_Monedero", id_monedero)
          .query(querys.obtenerUltimaTransaccionBitacora);

        return (insertado.recordset[0]);
    } catch (error) {
        return res.send({error: error.message});
    }
}

const acumularComponenteCentral = async(id_cliente, Monto_Acum, caja, CuentaEncriptada) => {
    try {
        let resultado = await axios.post('localhost:3001/api/acumulacion-componente-central',{
            id_cliente: id_cliente,
            Monedero: CuentaEncriptada,
            Caja: caja,
            Cajero: "9999",
            Sucursal: "999",
            Monto: Monto_Acum,
            TipoMovimiento: "I"
        })
        return resultado.data;
    } catch (error) {
        return ({error: error.message});
    }
}

const actualizarBitacoraBeneficio = async(id) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
          .input("id", sql.Int, id)
          .input("Estatus_Movimiento", sql.VarChar, "AumulacionCompleta")
          .query(querys.actualizarBitacoraBeneficio);
       return ({status: 'ok'});
    } catch (error) {
        console.log('erorr');
        return ({error: error.message});
    }
};

module.exports = {
    bitacoraBeneficio,
}