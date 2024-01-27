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

export const getRepositoryList = async (isGraphQlQuery) => {
    if (isGraphQlQuery) {
        const query = `query getRepositoryList {
            getRepositories {
                createdAt
                diskUsage
                name
                nameWithOwner
            }
          }`;
        return graphQlFetch('getRepositoryList', query, {})
    }
    const resp = await fetch(`${apiEndpoint}/api/repository`, {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        },
    });
    const data = await resp.json();
    return { getRepositories: data };    
}

export const scanAllRepo = async (isGraphQlQuery) => {
    if(isGraphQlQuery) {
        const query = `query scanAllRepo {
            scanAllRepository {
              createdAt
              diskUsage
              name
              nameWithOwner
              scanDetails {
                activeWebHooks {
                  contentType
                  active
                  createdAt
                  deliveriesUrl
                  events
                  type
                  updatedAt
                }
                content {
                  fileName
                  text
                }
                defaultBranch
                diskUsage
                isPrivate
                owner
                totalCount
              }
            }
          }`;
        return graphQlFetch('scanAllRepo', query, {})
    }
    const resp = await fetch(`${apiEndpoint}/api/scan-all-repository`, {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        },
    });
    const data = await resp.json();
    return { scanAllRepository: data }; 
}

export const getRepositoryByName = async (name, isGraphQlQuery) => {
    if(isGraphQlQuery) {
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
    const resp = await fetch(`${apiEndpoint}/api/repository/${name}`, {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        },
    });
    const data = await resp.json();
    return { scanRepository: data }; 
}