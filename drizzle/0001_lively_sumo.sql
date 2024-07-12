CREATE TABLE `accolade` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdAt` timestamp NOT NULL,
	`item` text,
	`lang` text,
	CONSTRAINT `accolade_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brand` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text,
	`logo` text,
	CONSTRAINT `brand_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` text,
	`value` text,
	`lang` text,
	CONSTRAINT `meta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` text,
	`title` text,
	`content` text,
	`lang` text,
	CONSTRAINT `page_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` text,
	`createdAt` timestamp NOT NULL,
	`title` text,
	`content` text,
	`media` text,
	`lang` text,
	CONSTRAINT `portfolio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `user`;