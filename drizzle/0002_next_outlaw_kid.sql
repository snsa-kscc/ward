ALTER TABLE `portfolio` MODIFY COLUMN `slug` varchar(512);--> statement-breakpoint
ALTER TABLE `portfolio` MODIFY COLUMN `title` varchar(512);--> statement-breakpoint
ALTER TABLE `portfolio` MODIFY COLUMN `media` varchar(1024);--> statement-breakpoint
ALTER TABLE `portfolio` MODIFY COLUMN `lang` varchar(6);--> statement-breakpoint
ALTER TABLE `portfolio` ADD CONSTRAINT `portfolio_title_unique` UNIQUE(`title`);