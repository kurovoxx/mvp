CREATE TABLE `activos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`categoria` text NOT NULL,
	`nivel_criticidad` text NOT NULL,
	`estado` text DEFAULT 'disponible' NOT NULL,
	`ubicacion_fisica` text NOT NULL,
	`fecha_ultima_calibracion` integer,
	`fecha_vencimiento_calibracion` integer,
	`vida_util_estimada_dias` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `prestamos` (
	`id` text PRIMARY KEY NOT NULL,
	`id_activo` text NOT NULL,
	`id_mecanico` text NOT NULL,
	`id_pañolero_salida` text,
	`id_orden_trabajo` text NOT NULL,
	`fecha_hora_salida` integer,
	`fecha_hora_devolucion` integer,
	`inspeccion_salida_pañolero` integer DEFAULT false,
	`inspeccion_salida_mecanico` integer DEFAULT false,
	`resultado_inspeccion_salida` text,
	`inspeccion_devolucion_pañolero` integer DEFAULT false,
	`resultado_inspeccion_devolucion` text,
	`fallo_reportado_uso` integer DEFAULT false,
	`descripcion_fallo` text,
	`id_pañolero_devolucion` text,
	`cierre_validado` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`id_activo`) REFERENCES `activos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_mecanico`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_pañolero_salida`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_pañolero_devolucion`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `historial_estados` (
	`id` text PRIMARY KEY NOT NULL,
	`id_activo` text NOT NULL,
	`estado_anterior` text NOT NULL,
	`estado_nuevo` text NOT NULL,
	`id_usuario_responsable` text NOT NULL,
	`motivo` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`id_activo`) REFERENCES `activos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_usuario_responsable`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `evaluaciones_tecnicas` (
	`id` text PRIMARY KEY NOT NULL,
	`id_prestamo` text NOT NULL,
	`id_inspector` text NOT NULL,
	`fecha_evaluacion` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`clasificacion_causa` text NOT NULL,
	`descripcion_tecnica` text NOT NULL,
	`dictamen` text NOT NULL,
	`requiere_accion_rrhh` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`id_prestamo`) REFERENCES `prestamos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_inspector`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`rol` text NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);