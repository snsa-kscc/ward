ALTER TABLE `meta` MODIFY COLUMN `key` varchar(255);--> statement-breakpoint
ALTER TABLE `meta` MODIFY COLUMN `lang` varchar(6);--> statement-breakpoint
ALTER TABLE `meta` ADD `section` varchar(255);