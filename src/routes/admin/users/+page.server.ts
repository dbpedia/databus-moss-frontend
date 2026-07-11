import { redirect } from '@sveltejs/kit';
import { getDefaultAdminPath, hasPermission, PERMISSIONS } from '$lib/utils/auth-utils';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const parentData = await parent();
	const userData = parentData?.userData;

	const canReadUsers = hasPermission(userData, PERMISSIONS.READ_USERS);
	const canWriteRoles = hasPermission(userData, PERMISSIONS.WRITE_ROLES);

	if (!canReadUsers && !canWriteRoles) {
		const defaultPath = getDefaultAdminPath(userData);
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
