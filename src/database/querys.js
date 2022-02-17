export const querys = {
  obtenerUltimaTransaccion: "SELECT TOP (1) * FROM Monedero_Trans WHERE Id_Monedero = @Id_Monedero ORDER BY Id_Trans DESC",
  insertMonederoDb: "INSERT INTO Monedero_Trans (Id_Cliente, FechaHora, TipoMov, Id_Monedero, Monto, Transaccion) VALUES (@Id_Cliente,@FechaHora,@TipoMov,@Id_Monedero,@Monto,@Transaccion);",
  actualizarMonederoDb: "UPDATE Monedero_Trans SET Estatus = @Estatus, Autorizacion = @Autorizacion, Error = @Error WHERE Id_Trans = @Id_Trans",
  insertClienteBitacoraBeneficio: "INSERT INTO Bitacora_BeneficioCF (tipo_cliente, id_clienteapp, correo, tipo_proceso, id_pedido, monto_total, fecha_pago, forma_pago, monto_acum, estatus_movimiento, id_monedero, caja) VALUES (@tipo_cliente, @id_clienteapp, @correo, @tipo_proceso, @id_pedido, @monto_total, @fecha_pago, @forma_pago, @monto_acum, @estatus_movimiento, @id_monedero, @caja);",
  obtenerUltimaTransaccionBitacora: "SELECT TOP (1) * FROM Bitacora_BeneficioCF WHERE Id_Monedero = @Id_Monedero ORDER BY id DESC",
};