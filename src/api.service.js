const apiEndpoint = process.env.REACT_APP_BASE_URL;

const graphQlFetch = async (operationName, query, variables) => {
    const resp = await fetch(`${apiEndpoint}/graphql`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({operationName, query, variables})
    });
    const { data, errors } = await resp.json();
    if(errors) {
        throw errors;
    }
    return data;   
}

export const getRepositoryList = (first, after = null, before = null) => {
    const query = `query getRepositoryList($first: Int) {
        getRepositories(first: $first) {
          nextPageParams {
            after
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
          prevPageParams {
            before
          }
          data {
            createdAt
            diskUsage
            name
            nameWithOwner
          }
        }
      }`;
    return graphQlFetch('getRepositoryList', query, {
        first,
        ...(after && { after }),
        ...(before && { before })
    })
}

export const getRepositoryByName = (name) => {
    const query = `query getRepositoryByName($name: String!) {
        scanRepository(name: $name) {
          content {
            fileName
            text
          }
          diskUsage
          isPrivate
          defaultBranch
          owner
          totalCount
          activeWebHooks {
            active
            contentType
            createdAt
            deliveriesUrl
            events
            type
            updatedAt
          }
        }
      }`;
    return graphQlFetch('getRepositoryByName', query, { name })
}