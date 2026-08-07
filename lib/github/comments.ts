
type CommentParams = {
    octokit: {
        rest: {
            issues: {
                createComment: (params: {
                    owner: string;
                    repo: string;
                    issue_number: number;
                    body: string;
                }) => Promise<unknown>;
            };
        };
    };
    owner: string;
    repo: string;
    issue_number: number;
    body: string;
};


export async function addComment(params: CommentParams) {
  const { octokit, owner, repo, issue_number, body } = params;
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number,
    body,
  });
}
