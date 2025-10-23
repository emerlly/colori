CREATE TABLE `designUploads` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100),
	`uploadedAt` timestamp DEFAULT (now()),
	CONSTRAINT `designUploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`subtotal` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderServices` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `orderServices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320),
	`customerPhone` varchar(20),
	`status` enum('pending','processing','ready','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`subtotal` int NOT NULL,
	`discount` int NOT NULL DEFAULT 0,
	`discountPercentage` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`basePrice` int NOT NULL,
	`sku` varchar(100) NOT NULL,
	`category` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `stock` (
	`id` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`minimumLevel` int DEFAULT 10,
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockMovements` (
	`id` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`orderId` varchar(64),
	`movementType` enum('purchase','sale','adjustment','return') NOT NULL,
	`quantity` int NOT NULL,
	`reason` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stockMovements_id` PRIMARY KEY(`id`)
);
