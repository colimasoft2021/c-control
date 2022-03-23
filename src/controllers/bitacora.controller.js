import axios from 'axios';
import res from 'express/lib/response';
import { getConnection, querys, sql } from '../database/index';
import config from '../config';

const bitacoraBeneficio = async (req, res) => {
	const { tipo_cliente } = req.body;
	let resultado = {};
	if (tipo_cliente === 'invitado') {
		resultado = await procesoInvitado(res, req.body);
	} else {
		resultado = await procesoRegistrado(res, req.body);
	}
	return res.send(resultado);
};

const procesoRegistrado = async (res, data) => {
	const { Estatus_Movimiento, id_cliente, Monto_Acum, caja, id_monedero } =
		data;
	let resultadoRegistro = await registrarClienteBitacoraBeneficio(
		res,
		data,
		id_monedero
	);
	if (resultadoRegistro.error) {
		return { Error: resultadoRegistro.error };
	}
	if (
		Estatus_Movimiento === 'PagoPendiente' ||
		Estatus_Movimiento === 'PagoCancelado'
	) {
		return { CodigoEstatus: '03', MensajeEstatus: Estatus_Movimiento };
	} else if (Estatus_Movimiento === 'PendienteAcumulacion') {
		let resultadoAcumulacion = await acumularComponenteCentral(
			id_cliente,
			Monto_Acum,
			caja,
			id_monedero
		);
		if (resultadoAcumulacion.error) {
			return { Error: resultadoAcumulacion.error };
		}
		if (resultadoAcumulacion.CodigoEstatus === '00') {
			let resultadoActualizacion = actualizarBitacoraBeneficio(
				resultadoRegistro.id
			);
			if (resultadoActualizacion.error) {
				return { Error: resultadoRegistro.error };
			}
			return {
				CodigoEstatus: '04',
				MensajeEstatus: 'Acumulación existosa',
				MontoAcumulado: Monto_Acum,
			};
		} else {
			return {
				CodigoEstatus: '05',
				MensajeEstatus: 'Acumulación pendiente',
				MontoAcumulado: '',
			};
		}
	}
};

const procesoInvitado = async (res, data) => {
	const { Correo, id_monedero } = data;
	let datosCliente = await obtenerDatosCliente(Correo);
	if (!datosCliente.length) {
		return { CodigoEstatus: '01', MensajeEstatus: 'Sin monedero CF' };
	}
	if (datosCliente.ESTATUSCUENTA === false) {
		return { CodigoEstatus: '02', MensajeEstatus: 'Monedero CF inactivo' };
	}
	let Numero_cuenta = encriptarBase64(datosCliente.NUMEROCUENTA);
	let resultadoRegistro = await registrarClienteBitacoraBeneficio(
		res,
		data,
		Numero_cuenta
	);
	if (resultadoRegistro.error) {
		return { Error: resultadoRegistro.error };
	} else {
		return {
			CodigoEstatus: '02',
			MensajeEstatus: 'El cliente se ha registraod correctamente',
		};
	}
};

const obtenerDatosCliente = async (Correo) => {
	try {
		const resultado = await axios.get(
			`https://cftest.dswenlinea.mx/api/Client?CORREO=${Correo}&CELULAR=`
		);
		return resultado.data;
	} catch (error) {
		return res.send({ error: error.message });
	}
};

const encriptarBase64 = (dato) => {
	let buff = Buffer.from(dato);
	let encoded = buff.toString('base64');
	return encoded;
};

const registrarClienteBitacoraBeneficio = async (res, data, Numero_cuenta) => {
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
		caja,
	} = data;

	try {
		const pool = await getConnection();
		await pool
			.request()
			.input('tipo_cliente', sql.VarChar, tipo_cliente)
			.input('id_clienteapp', sql.Int, id_cliente)
			.input('correo', sql.VarChar, Correo)
			.input('tipo_proceso', sql.VarChar, Tipo_proceso)
			.input('id_pedido', sql.Int, id_Pedido)
			.input('monto_total', sql.Money, Monto_Total)
			.input('fecha_pago', sql.DateTime, Fecha_Pago)
			.input('forma_pago', sql.VarChar, Forma_Pago)
			.input('monto_acum', sql.Money, Monto_Acum)
			.input('estatus_movimiento', sql.VarChar, Estatus_Movimiento)
			.input('id_monedero', sql.VarChar, Numero_cuenta)
			.input('caja', sql.Int, caja)
			.query(querys.insertClienteBitacoraBeneficio);

		const insertado = await pool
			.request()
			.input('Id_Monedero', Numero_cuenta)
			.query(querys.obtenerUltimaTransaccionBitacora);

		return insertado.recordset[0];
	} catch (error) {
		return { error: error.message };
	}
};

const acumularComponenteCentral = async (
	id_cliente,
	Monto_Acum,
	caja,
	id_monedero
) => {
	try {
		let resultado = await axios.post(
			`http://${config.host}:${config.port}/api/acumulacion-componente-central`,
			{
				id_cliente: id_cliente,
				Monedero: id_monedero,
				Caja: caja,
				Cajero: '9999',
				Sucursal: '9999',
				Monto: Monto_Acum,
				TipoMovimiento: 'I',
			},
			{
				auth: {
					username: config.auth_user,
					password: config.auth_password,
				},
			}
		);
		return resultado.data;
	} catch (error) {
		return { error: error.message };
	}
};

const desencriptarBase64 = (encrypted) => {
	let buff = Buffer.from(encrypted, 'base64');
	let decoded = buff.toString('utf-8');
	return decoded;
};

const actualizarBitacoraBeneficio = async (id) => {
	try {
		const pool = await getConnection();
		const result = await pool
			.request()
			.input('id', sql.Int, id)
			.input('Estatus_Movimiento', sql.VarChar, 'AumulacionCompleta')
			.query(querys.actualizarBitacoraBeneficio);
		return { status: 'ok' };
	} catch (error) {
		return { error: error.message };
	}
};

const actualizacionBitacoraBeneficio = async (req, res) => {
	const { Id_pedido, Estatus_Movimiento } = req.body;

    const IdPedido = Id_pedido.toString();
    
	if (IdPedido.length > 10) {
		return res.send({MensajeEstatus: 'Id de pedido invalido.'});
	} else {
		try {
			const pool = await getConnection();
			const dataResult = await pool
				.request()
				.input('id_pedido', sql.Int, Id_pedido)
				.query(querys.obtenerBitacoraBeneficio);
			if (dataResult.recordset.length > 0) {
				dataResult.recordset.map(async (item) => {
					const insertado = await pool
						.request()
						.input('id', sql.Int, item.id)
						.input('Estatus_Movimiento', sql.VarChar, Estatus_Movimiento)
						.query(querys.actualizarBitacoraBeneficio);
				});
				return res.send({
					CodigoEstatus: '06',
					MensajeEstatus: 'Estatus actualizado a ' + Estatus_Movimiento,
				});
			} else {
				return res.send({
					CodigoEstatus: '06',
					MensajeEstatus: 'Pedido no existe',
				});
			}
		} catch (error) {
			return { error: error.message };
		}
	}
};

module.exports = {
	bitacoraBeneficio,
	actualizacionBitacoraBeneficio,
};
