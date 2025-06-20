import { GithubCommit } from "~/@types/github";

const config = useRuntimeConfig();

export default defineEventHandler(
	async () => await getCommits(),
);

const getCommits = async () => {
	return await $fetch<GithubCommit[]>(
		`https://api.github.com/repos/${config.GITHUB_USERNAME}/${config.GITHUB_REPOSITORY_NAME}/commits`,
	)
}