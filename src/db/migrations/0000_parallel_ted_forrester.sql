CREATE TABLE `answers` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`answer` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `answers_lesson_id_idx` ON `answers` (`lesson_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `history` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`answer` text,
	`response_time` integer,
	`attemptedAt` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `history_question_id_idx` ON `history` (`question_id`);--> statement-breakpoint
CREATE INDEX `history_attempt_date_idx` ON `history` (`attemptedAt`);--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_id` text NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`favorite` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `lessons_subject_id_idx` ON `lessons` (`subject_id`);--> statement-breakpoint
CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`review_interval` text,
	`last_attempt_date` integer,
	`next_attempt_date` integer,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `progress_next_attempt_date_idx` ON `progress` (`next_attempt_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `progress_question_unique` ON `progress` (`question_id`);--> statement-breakpoint
CREATE TABLE `question_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`answer_id` text NOT NULL,
	`is_correct` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_answer_unique` ON `question_answers` (`question_id`,`answer_id`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`question` text NOT NULL,
	`explanation` text,
	`image` text,
	`code` text,
	`language` text,
	`type` text DEFAULT 'multiple_choice' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `questions_lesson_id_idx` ON `questions` (`lesson_id`);--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `subjects_category_id_idx` ON `subjects` (`category_id`);