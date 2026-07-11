import { hasPermission, PERMISSIONS } from '$lib/utils/auth-utils';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ parent }) {
	const parentData = await parent();
	const userData = parentData?.userData;

	return {
		...parentData,
		canWriteModules: hasPermission(userData, PERMISSIONS.WRITE_MODULES),
		canWriteTerminologies: hasPermission(userData, PERMISSIONS.WRITE_TERMINOLOGIES),
		canWriteFacets: hasPermission(userData, PERMISSIONS.WRITE_FACETS),
		canReadUsers: hasPermission(userData, PERMISSIONS.READ_USERS),
		canWriteRoles: hasPermission(userData, PERMISSIONS.WRITE_ROLES)
	};
}
