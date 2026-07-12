import { redirect } from '@sveltejs/kit';
import { getDefaultAdminPath, hasPermission, PERMISSIONS } from '$lib/utils/auth-utils';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const parentData = await parent();
	const caller = parentData?.caller;

	const canReadUsers = hasPermission(caller, PERMISSIONS.READ_USERS);
	const canWriteRoles = hasPermission(caller, PERMISSIONS.WRITE_ROLES);

	if (!canReadUsers && !canWriteRoles) {
		const defaultPath = getDefaultAdminPath(caller);
		if (defaultPath && defaultPath !== '/admin/users') {
			throw redirect(302, defaultPath);
		}

		return {
			canReadUsers: false,
			canWriteRoles: false
		};
	}

	return {
		...parentData,
		canReadUsers,
		canWriteRoles
	};
}
