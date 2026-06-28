CREATE TABLE `ai_summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekNumber` int NOT NULL,
	`summaryDate` date NOT NULL,
	`momStatusJson` json NOT NULL,
	`dadPlanJson` json NOT NULL,
	`dataSource` enum('live','yesterday','preset') DEFAULT 'preset',
	`modelUsed` varchar(64),
	`promptTokens` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_summaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`type` varchar(32) NOT NULL,
	`title` varchar(256) NOT NULL,
	`notes` text,
	`dadAttending` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`speaker` enum('dad','doctor') NOT NULL,
	`originalText` text NOT NULL,
	`translatedText` text NOT NULL,
	`originalLanguage` varchar(10) NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`inputMethod` enum('text','voice') NOT NULL DEFAULT 'text',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consultation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultation_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL DEFAULT 'Consultation',
	`dadLanguage` varchar(10) NOT NULL DEFAULT 'zh',
	`doctorLanguage` varchar(10) NOT NULL DEFAULT 'en',
	`pregnancyWeek` int,
	`status` enum('active','ended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	CONSTRAINT `consultation_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dad_game_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`xp` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`title` varchar(100) NOT NULL DEFAULT 'Rookie Dad',
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`shieldsAvailable` int NOT NULL DEFAULT 1,
	`lastActivityDate` varchar(10),
	`totalMissionsCompleted` int NOT NULL DEFAULT 0,
	`totalHealthLogs` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dad_game_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `dad_game_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `dad_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`xp` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`shieldsAvailable` int NOT NULL DEFAULT 0,
	`totalMissionsCompleted` int NOT NULL DEFAULT 0,
	`lastCheckinDate` date,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dad_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `dad_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `daily_missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`missionDate` varchar(10) NOT NULL,
	`templateId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`actionType` varchar(50) NOT NULL,
	`xpReward` int NOT NULL DEFAULT 20,
	`icon` varchar(50) DEFAULT 'star',
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `father_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255),
	`age` int,
	`location` varchar(255),
	`preferredLanguage` varchar(10) DEFAULT 'en',
	`firstTimeDad` boolean DEFAULT true,
	`notificationPreferences` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `father_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `father_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `health_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`motherProfileId` int NOT NULL,
	`recordedByUserId` int NOT NULL,
	`recordDate` timestamp NOT NULL DEFAULT (now()),
	`pregnancyWeek` int,
	`systolicBp` int,
	`diastolicBp` int,
	`bloodGlucose` decimal(5,2),
	`weight` decimal(5,2),
	`swellingLevel` enum('none','mild','moderate','severe'),
	`fetalMovementCount` int,
	`sleepQualityScore` int,
	`waterIntakeMl` int,
	`folicAcidTaken` boolean DEFAULT false,
	`dhaTaken` boolean DEFAULT false,
	`ironTaken` boolean DEFAULT false,
	`calciumTaken` boolean DEFAULT false,
	`dietBalanceScore` int,
	`moodTags` json,
	`stressLevel` int,
	`anxietyLevel` int,
	`fatherNotes` text,
	`symptoms` json,
	`freeTextNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mission_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pregnancyWeek` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`actionType` enum('log_health','tick_checklist','post_discussion','save_appointment','read_week_content','write_reflection','custom') NOT NULL,
	`xpReward` int NOT NULL DEFAULT 20,
	`icon` varchar(50) DEFAULT 'star',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mission_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mom_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logDate` date NOT NULL,
	`weekNumber` int NOT NULL,
	`energyLevel` int,
	`nauseaLevel` int,
	`painLevel` int,
	`sleepHours` decimal(3,1),
	`waterMl` int,
	`weightKg` decimal(4,1),
	`kickCount` int,
	`moodScore` int,
	`anxietyScore` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mom_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mother_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkedFatherUserId` int NOT NULL,
	`name` varchar(255),
	`dateOfBirth` timestamp,
	`estimatedDueDate` timestamp,
	`pregnancyStartDate` timestamp,
	`currentPregnancyWeek` int DEFAULT 1,
	`bloodType` varchar(10),
	`allergies` text,
	`existingConditions` text,
	`currentMedications` text,
	`hospitalName` varchar(255),
	`gpName` varchar(255),
	`midwifeName` varchar(255),
	`maternityTriageNumber` varchar(50),
	`emergencyContactName` varchar(255),
	`emergencyContactPhone` varchar(50),
	`consentStatus` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mother_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pregnancies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dueDate` date NOT NULL,
	`babyNickname` varchar(64),
	`lmpDate` date,
	`partnerName` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pregnancies_id` PRIMARY KEY(`id`),
	CONSTRAINT `pregnancies_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `risk_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`motherProfileId` int NOT NULL,
	`healthRecordId` int,
	`riskLevel` enum('normal','watch','needs_attention','urgent','emergency') NOT NULL,
	`riskCategory` varchar(100),
	`title` varchar(255),
	`explanation` text,
	`suggestedNextStep` text,
	`emergencyGuidance` text,
	`status` enum('active','acknowledged','resolved') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `risk_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `risk_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`riskCategory` varchar(100),
	`conditionJson` json,
	`riskLevel` enum('normal','watch','needs_attention','urgent','emergency') NOT NULL,
	`explanationTemplate` text,
	`suggestedNextStep` text,
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `risk_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `symptoms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`logId` int NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`severity` enum('mild','moderate','severe') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `symptoms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `xp_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`xpAwarded` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`actionType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `xp_events_id` PRIMARY KEY(`id`)
);
