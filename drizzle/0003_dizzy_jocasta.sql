ALTER TABLE `store` MODIFY COLUMN `key` varchar(255);--> statement-breakpoint
ALTER TABLE `store` MODIFY COLUMN `lang` varchar(6);--> statement-breakpoint
ALTER TABLE `store` ADD `section` varchar(255);