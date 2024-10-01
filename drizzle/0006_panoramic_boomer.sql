ALTER TABLE `page` MODIFY COLUMN `slug` varchar(512);--> statement-breakpoint
ALTER TABLE `page` MODIFY COLUMN `title` varchar(512);--> statement-breakpoint
ALTER TABLE `page` MODIFY COLUMN `lang` varchar(6);--> statement-breakpoint
ALTER TABLE `page` ADD COLUMN `name` varchar(512);--> statement-breakpoint
ALTER TABLE `page` ADD CONSTRAINT `page_name_unique` UNIQUE(`name`);