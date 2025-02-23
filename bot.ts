import { WhatsAppBot, State } from "@green-api/whatsapp-chatbot-js-v2";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import * as dotenv from "dotenv";

dotenv.config();

interface StringsData {
	session_timeout_message: Record<string, string>;
	select_language: string;
	specify_language: string;
	please_use_text: string;
	welcome_message: Record<string, string>;
	stop_message: Record<string, string>;
	menu: Record<string, string>;
	send_text_message: Record<string, string>;
	send_file_message: Record<string, string>;
	send_image_message: Record<string, string>;
	send_audio_message: Record<string, string>;
	send_video_message: Record<string, string>;
	send_contact_message: Record<string, string>;
	send_location_message: Record<string, string>;
	send_poll_message: Record<string, string>;
	get_avatar_message: Record<string, string>;
	send_link_message_preview: Record<string, string>;
	send_link_message_no_preview: Record<string, string>;
	add_to_contact: Record<string, string>;
	send_quoted_message: Record<string, string>;
	about_js_chatbot: Record<string, string>;
	link_to_docs: Record<string, string>;
	link_to_source_code: Record<string, string>;
	link_to_green_api: Record<string, string>;
	link_to_console: Record<string, string>;
	link_to_youtube: Record<string, string>;
	not_recognized_message: Record<string, string>;
	poll_question: Record<string, string>;
	poll_option_1: Record<string, string>;
	poll_option_2: Record<string, string>;
	poll_option_3: Record<string, string>;
	poll_answer_1: Record<string, string>;
	poll_answer_2: Record<string, string>;
	poll_answer_3: Record<string, string>;
	avatar_found: Record<string, string>;
	avatar_not_found: Record<string, string>;
	group_name: Record<string, string>;
	group_created_message: Record<string, string>;
	send_group_message: Record<string, string>;
	send_group_message_set_picture_false: Record<string, string>;
	bot_name: Record<string, string>;
	links: Record<string, {
		send_text_documentation: string;
		send_file_documentation: string;
		send_contact_documentation: string;
		send_location_documentation: string;
		send_poll_documentation: string;
		get_avatar_documentation: string;
		send_link_documentation: string;
		send_quoted_message_documentation: string;
		chatbot_documentation: string;
		chatbot_source_code: string;
		greenapi_website: string;
		greenapi_console: string;
		youtube_channel: string;
		create_group_documentation: string;
	}>;
}

interface CustomSessionData {
	lang?: string;
	last_touch_timestamp?: number;
}

function getStringsData(): StringsData {
	try {
		const yamlFile = readFileSync("strings.yml", "utf8");
		return load(yamlFile) as StringsData;
	} catch (error) {
		console.error("Error loading strings:", error);
		process.exit(1);
	}
}

const strings = getStringsData();

const bot = new WhatsAppBot<CustomSessionData>({
	idInstance: process.env.INSTANCE_ID!,
	apiTokenInstance: process.env.INSTANCE_TOKEN!,
	defaultState: "start",
	backCommands: "back",
	sessionTimeout: 300,
	getSessionTimeoutMessage: (session) => {
		const lang = session.stateData?.lang || "en";
		return strings.session_timeout_message[lang];
	},
	clearWebhookQueueOnStart: true,
	settings: {
		webhookUrl: "",
		webhookUrlToken: "",
		outgoingWebhook: "no",
		stateWebhook: "no",
		incomingWebhook: "yes",
		outgoingAPIMessageWebhook: "no",
		outgoingMessageWebhook: "no",
		pollMessageWebhook: "yes",
		markIncomingMessagesReaded: "yes",
	},
});

const startState: State<CustomSessionData> = {
	name: "start",
	async onEnter(message) {
		await bot.sendText(message.chatId, strings.select_language);
	},
	async onMessage(message, data = {last_touch_timestamp: Date.now()}) {
		const choice = message.text;
		const langs = {"1": "en", "2": "kz", "3": "ru", "4": "es", "5": "he", "6": "ar"};

		if (choice && choice in langs) {
			return {
				state: "main",
				data: {...data, lang: langs[choice as keyof typeof langs]},
			};
		}

		await bot.sendText(message.chatId, strings.specify_language);
		return undefined;
	},
};

const mainState: State<CustomSessionData> = {
	name: "main",
	async onEnter(message, data) {
		const lang = data?.lang || "en";
		await bot.sendFileByUpload(message.chatId, {
			filePath: `assets/welcome_${lang === "ru" ? "ru" : "en"}.png`,
			fileName: "welcome.png",
			caption: strings.welcome_message[lang] + `*${message.senderName}*!\n` + strings.menu[lang],
		});
	},
	async onMessage(message, data) {
		const lang = data?.lang || "en";
		const choice = message.text;

		if (message.type === "pollUpdate" && message.pollUpdate) {
			const votes = message.pollUpdate.votes;
			const isYes = votes[0].optionVoters.includes(message.chatId);
			const isNo = votes[1].optionVoters.includes(message.chatId);
			const isHardToAnswer = votes[2].optionVoters.includes(message.chatId);

			if (isYes) {
				await bot.sendText(message.chatId, strings.poll_answer_1[lang]);
			} else if (isNo) {
				await bot.sendText(message.chatId, strings.poll_answer_2[lang]);
			} else if (isHardToAnswer) {
				await bot.sendText(message.chatId, strings.poll_answer_3[lang]);
			}
			return undefined;
		}

		switch (choice) {
			case "1":
				await bot.sendText(
					message.chatId,
					strings.send_text_message[lang] + strings.links[lang].send_text_documentation,
				);
				break;

			case "2":
				await bot.sendFileByUrl(message.chatId, {
					url: "https://storage.yandexcloud.net/sw-prod-03-test/ChatBot/corgi.pdf",
					fileName: "image.pdf",
					caption: strings.send_file_message[lang] + strings.links[lang].send_file_documentation,
				});
				break;

			case "3":
				await bot.sendFileByUrl(message.chatId, {
					url: "https://storage.yandexcloud.net/sw-prod-03-test/ChatBot/corgi.jpg",
					fileName: "image.jpg",
					caption: strings.send_image_message[lang] + strings.links[lang].send_file_documentation,
				});
				break;

			case "4":
				const audioUrl = lang === "ru"
					? "https://storage.yandexcloud.net/sw-prod-03-test/ChatBot/Audio_bot.mp3"
					: "https://storage.yandexcloud.net/sw-prod-03-test/ChatBot/Audio_bot_eng.mp3";

				await bot.sendText(
					message.chatId,
					strings.send_audio_message[lang] + strings.links[lang].send_file_documentation,
				);
				await bot.sendFileByUrl(message.chatId, {
					url: audioUrl,
					fileName: "audio.mp3",
					caption: strings.send_audio_message[lang] + strings.links[lang].send_file_documentation,
				});
				break;

			case "5":
				const videoUrl = lang === "ru"
					? "https://storage.yandexcloud.net/sw-prod-03-test/ChatBot/Video_bot_ru.mp4"
					: "https://storage.yandexcloud.net/sw-prod-03-test/ChatBot/Video_bot_eng.mp4";

				await bot.sendFileByUrl(message.chatId, {
					url: videoUrl,
					fileName: "video.mp4",
					caption: strings.send_video_message[lang] + strings.links[lang].send_file_documentation,
				});
				break;

			case "6":
				await bot.sendText(
					message.chatId,
					strings.send_contact_message[lang] + strings.links[lang].send_contact_documentation,
				);
				await bot.sendContact(message.chatId, {
					firstName: message.senderName,
					phoneContact: parseInt(message.chatId),
				});
				break;

			case "7":
				await bot.sendText(
					message.chatId,
					strings.send_location_message[lang] + strings.links[lang].send_location_documentation,
				);
				await bot.sendLocation(message.chatId, {
					latitude: 35.888171,
					longitude: 14.440230,
					name: "Malta Island",
					address: "Malta Island",
				});
				break;

			case "8":
				await bot.sendText(
					message.chatId,
					strings.send_poll_message[lang] + strings.links[lang].send_poll_documentation,
				);
				await bot.sendPoll(message.chatId, {
					question: strings.poll_question[lang],
					options: [
						strings.poll_option_1[lang],
						strings.poll_option_2[lang],
						strings.poll_option_3[lang],
					],
				});
				break;

			case "9":
				await bot.sendText(
					message.chatId,
					strings.get_avatar_message[lang] + strings.links[lang].get_avatar_documentation,
				);
				const avatar = await bot.api.instance.getAvatar(message.chatId, null);
				if (avatar.urlAvatar) {
					await bot.sendFileByUrl(message.chatId, {
						url: avatar.urlAvatar,
						fileName: "avatar",
						caption: strings.avatar_found[lang],
					});
				} else {
					await bot.sendText(message.chatId, strings.avatar_not_found[lang]);
				}
				break;

			case "10":
				await bot.sendText(
					message.chatId,
					strings.send_link_message_preview[lang] + strings.links[lang].send_link_documentation,
				);
				await bot.sendText(
					message.chatId,
					strings.send_link_message_no_preview[lang] + strings.links[lang].send_link_documentation,
					{linkPreview: false},
				);
				break;

			case "11":
				await bot.sendText(message.chatId, strings.add_to_contact[lang]);
				return {state: "create_group", data};

			case "12":
				await bot.sendText(
					message.chatId,
					strings.send_quoted_message[lang] + strings.links[lang].send_quoted_message_documentation,
					{quotedMessageId: message.messageId},
				);
				break;

			case "13":
				await bot.sendFileByUpload(message.chatId, {
					filePath: "assets/about_js.jpg",
					fileName: "about_js.jpg",
					caption: strings.about_js_chatbot[lang] +
						strings.link_to_docs[lang] + strings.links[lang].chatbot_documentation +
						strings.link_to_source_code[lang] + strings.links[lang].chatbot_source_code +
						strings.link_to_green_api[lang] + strings.links[lang].greenapi_website +
						strings.link_to_console[lang] + strings.links[lang].greenapi_console +
						strings.link_to_youtube[lang] + strings.links[lang].youtube_channel,
				});
				break;
			default:
				return null;
		}

		return undefined;
	},
};

const createGroupState: State<CustomSessionData> = {
	name: "create_group",
	async onEnter(message, data) {
		const lang = data?.lang || "en";
		await bot.sendContact(message.chatId, {
			firstName: strings.bot_name[lang],
			phoneContact: parseInt(bot.wid.split("@c.us")[0]),
		});
	},
	async onMessage(message, data) {
		const lang = data?.lang || "en";
		if (message.text === "1") {
			try {
				const group = await bot.api.group.createGroup(
					strings.group_name[lang],
					[message.chatId],
				);

				if (group.created) {
					const setGroupPicture = await bot.api.group.setGroupPicture(
						group.chatId,
						"assets/group_avatar.jpg",
					);

					if (setGroupPicture.setGroupPicture) {
						await bot.sendText(
							group.chatId,
							strings.send_group_message[lang] +
							strings.links[lang].create_group_documentation,
						);
					} else {
						await bot.sendText(
							group.chatId,
							strings.send_group_message_set_picture_false[lang] +
							strings.links[lang].create_group_documentation,
						);
					}

					await bot.sendText(
						message.chatId,
						strings.group_created_message[lang] + group.groupInviteLink,
					);
				}
			} catch (error) {
				console.error("Error creating group:", error);
			}
			return {state: "main", skipOnEnter: true};
		} else if (message.text === "0") {
			return {state: "main", data};
		}

		return null;
	},
};

bot.addState(startState);
bot.addState(mainState);
bot.addState(createGroupState);

bot.onText(["стоп", "stop", "0"], async (message, session) => {
	const lang = session.stateData?.lang || "en";
	await bot.sendText(
		message.chatId,
		strings.stop_message[lang] + `*${message.senderName}*!`,
	);
	await bot.enterState(message, session, "start");
});

bot.onText(["menu", "меню"], async (message, session) => {
	await bot.enterState(message, session, "main");
});

bot.onType("*", async (message, session) => {
	const lang = session.stateData?.lang || "en";
	await bot.sendText(
		message.chatId,
		strings.not_recognized_message[lang],
	);
});

async function launchBot() {
	try {
		console.log("Starting the bot");
		await bot.start();
	} catch (error) {
		console.error("Error starting bot:", error);
		setTimeout(launchBot, 10000);
	}
}

launchBot().catch(console.error);
