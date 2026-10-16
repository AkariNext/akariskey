<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_panel">
	<MkContainer>
			<div :class="$style.banner" :style="$i.bannerUrl ? { backgroundImage: `url(${ $i.bannerUrl })` } : undefined" @click="changeBanner"></div>
			<div :class="$style.avatarContainer">
				<MkAvatar :class="$style.avatar" :user="$i" @click="changeAvatar"/>
				<MkA :class="$style.name" :to="userPage($i)" >
						<MkUserName :user="$i" style="font-weight: bold;"/>
					</MkA>
					
					<MkAcct :user="$i" :class="$style.name"/>
			</div>

		</MkContainer>
</div>
</template>

<script lang="ts" setup>
import type * as Misskey from 'misskey-js';
import { useWidgetPropsManager } from './widget.js';
import type { WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import type { FormWithDefault, GetFormResultType } from '@/utility/form.js';
import { i18n } from '@/i18n.js';
import { chooseDriveFile } from '@/utility/drive.js';
import * as os from '@/os.js';
import { ensureSignin } from '@/i.js';
import { claimAchievement } from '@/utility/achievements.js';
import { userPage } from '@@/js/user.js';

const $i = ensureSignin();

const name = 'classicProfile';

const widgetPropsDef = {
} satisfies FormWithDefault;

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});

function changeAvatar(ev: MouseEvent) {
	async function done(driveFile: Misskey.entities.DriveFile) {
		const i = await os.apiWithDialog('i/update', {
			avatarId: driveFile.id,
		});
		$i.avatarId = i.avatarId;
		$i.avatarUrl = i.avatarUrl;
		claimAchievement('profileFilled');
	}

	os.popupMenu([{
		text: i18n.ts.avatar,
		type: 'label',
	}, {
		text: i18n.ts.upload,
		icon: 'ti ti-upload',
		action: async () => {
			const files = await os.chooseFileFromPc({ multiple: false });
			const file = files[0];

			let originalOrCropped = file;

			const { canceled } = await os.confirm({
				type: 'question',
				text: i18n.ts.cropImageAsk,
				okText: i18n.ts.cropYes,
				cancelText: i18n.ts.cropNo,
			});

			if (!canceled) {
				originalOrCropped = await os.cropImageFile(file, {
					aspectRatio: 1,
				});
			}

			const driveFile = (await os.launchUploader([originalOrCropped], { multiple: false }))[0];
			done(driveFile);
		},
	}, {
		text: i18n.ts.fromDrive,
		icon: 'ti ti-cloud',
		action: () => {
			chooseDriveFile({ multiple: false }).then(files => {
				done(files[0]);
			});
		},
	}], ev.currentTarget ?? ev.target);
}

function changeBanner(ev: MouseEvent) {
	async function done(driveFile: Misskey.entities.DriveFile) {
		const i = await os.apiWithDialog('i/update', {
			bannerId: driveFile.id,
		});
		$i.bannerId = i.bannerId;
		$i.bannerUrl = i.bannerUrl;
	}

	os.popupMenu([{
		text: i18n.ts.banner,
		type: 'label',
	}, {
		text: i18n.ts.upload,
		icon: 'ti ti-upload',
		action: async () => {
			const files = await os.chooseFileFromPc({ multiple: false });
			const file = files[0];

			let originalOrCropped = file;

			const { canceled } = await os.confirm({
				type: 'question',
				text: i18n.ts.cropImageAsk,
				okText: i18n.ts.cropYes,
				cancelText: i18n.ts.cropNo,
			});

			if (!canceled) {
				originalOrCropped = await os.cropImageFile(file, {
					aspectRatio: 2,
				});
			}

			const driveFile = (await os.launchUploader([originalOrCropped], { multiple: false }))[0];
			done(driveFile);
		},
	}, {
		text: i18n.ts.fromDrive,
		icon: 'ti ti-cloud',
		action: () => {
			chooseDriveFile({ multiple: false }).then(files => {
				done(files[0]);
			});
		},
	}], ev.currentTarget ?? ev.target);
}
</script>

<style lang="scss" module>
.container {
	position: relative;
	background-size: cover;
	background-position: center;
	display: flex;
}

.banner {
	height: 100px;
	background-size: cover;
	background-position: center;
	cursor: pointer;
	background-color: #4c5e6d;
	box-shadow: 0 0 128px rgb(0 0 0 / 50%) inset;
}

.avatarContainer {
	padding-bottom: 16px;
}

.avatar {
	display: block;
		position: absolute;
		top: 76px;
		left: 16px;
		width: 58px;
		height: 58px;
		border: solid 3px var(--face);
		border-radius: 8px;
		cursor: pointer;

}

.bodyContainer {
	display: flex;
	align-items: center;
	min-width: 0;
	padding: 0 16px 0 0;
}

.body {
	text-overflow: ellipsis;
	overflow: clip;
}

.name {
	display: block;
		margin: 10px 0 0 84px;
		line-height: 16px;
		color: var(--fg);
		overflow: hidden;
		text-overflow: ellipsis;
}

.username {
	display: block;
		margin: 4px 0 8px 84px;
		line-height: 16px;
		font-size: 0.9em;
		color: var(--fg);
		opacity: 0.7;

}
</style>
