export function isServiceUnavailable(status: number | undefined): boolean {
	return status === 503;
}

export function isServerError(status: number | undefined): boolean {
	return status !== undefined && status >= 500 && status < 600;
}
