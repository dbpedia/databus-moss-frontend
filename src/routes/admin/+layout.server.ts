import { hasPermission, PERMISSIONS } from '$lib/utils/auth-utils';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ parent }) {
	const parentData = await parent();
	const caller = parentData?.caller;

	return {
		...parentData,
		canWriteModules: hasPermission(caller, PERMISSIONS.WRITE_MODULES),
		canWriteTerminologies: hasPermission(caller, PERMISSIONS.WRITE_TERMINOLOGIES),
		canWriteFacets: hasPermission(caller, PERMISSIONS.WRITE_FACETS),
		canReadUsers: hasPermission(caller, PERMISSIONS.READ_USERS),
		canWriteRoles: hasPermission(caller, PERMISSIONS.WRITE_ROLES)
	};
}
