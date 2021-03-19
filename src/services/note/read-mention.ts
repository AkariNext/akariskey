import { publishMainStream } from '../stream';
import { Note } from '../../models/entities/note';
import { User } from '../../models/entities/user';
import { NoteUnreads } from '../../models';
import { In } from 'typeorm';

/**
 * Mark a mention note as read
 */
export async function readMention(
	userId: User['id'],
	noteIds: Note['id'][]
) {
	// Remove the records
	await NoteUnreads.delete({
		userId: userId,
		noteId: In(noteIds),
	});

	const mentionsCount = await NoteUnreads.count({
		userId: userId,
		isMentioned: true
	});

	if (mentionsCount === 0) {
		// 全て既読になったイベントを発行
		publishMainStream(userId, 'readAllUnreadMentions');
	}
}
