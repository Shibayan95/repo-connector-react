import { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRepositoryByName, getRepositoryList } from './api.service';
import { Accordion, Row, Col, Container, Card, Spinner, Button } from 'react-bootstrap';

function App() {
  const defaultPageSize = 10;
  const [repoList, setRepoList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState(undefined);
  const [scannedRepoDetails, setScannedRepoDetails] = useState(undefined);
  const [isScanningRepo, setIsScanningRepo] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getRepositoryList(defaultPageSize).then(resp => {
      const { getRepositories: { data } } = resp;
      setRepoList(data);
    }).finally(() => setIsLoading(false))
  },[]);

  useEffect(() => {
    if(!selectedRepo) return;
    setIsScanningRepo(true);
    getRepositoryByName(selectedRepo).then(resp => {
      const { scanRepository } = resp;
      setScannedRepoDetails(scanRepository);
    }).finally(() => setIsScanningRepo(false));
  }, [selectedRepo])

  const SpinnerLocal = () => {
    return (
      <div style={{
        position: 'relative',
        width: '100%'
      }}>
        <Spinner className='mt-3' size='lg' animation="border" role="status">
          <span className="visually-hidden"></span>
      </Spinner>
      <p className='mt-3'>Loading</p>
      </div>
    )
  };
  return (
    <div className="App">
      <Container>
      <Card >
          <Card.Header>Repo Connector</Card.Header>
          {isLoading ? <SpinnerLocal /> : (
          <Card.Body>
        {repoList.length === 0 ? 'No Repos found' : (
            <Accordion className={isScanningRepo ? 'disabled': ''} onSelect={(name) => {
              if(name) {
                setSelectedRepo(undefined);
                setScannedRepoDetails(undefined);
              }
            }}>
              {repoList.map((repo, i) => (
                <Accordion.Item key={i} eventKey={repo.name}>
                  <Accordion.Header>{repo.name}</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={12} className='d-flex'>
                        <Col md={4}>
                          <b>Owner:</b> {repo.nameWithOwner}
                        </Col>
                        <Col md={4}>
                          <b>Disk Usage:</b> {repo.diskUsage}
                        </Col>
                        <Col md={4}>
                          <b>Created On:</b> {repo.createdAt}
                        </Col>
                      </Col>
                      {scannedRepoDetails ? (
                            <Card>
                              <Card.Header>Scan Details</Card.Header>
                              <Card.Body>
                                <Row>
                                  <Col md={12} className='d-flex'>
                                    <Col md={3}>
                                      <b>Default Branch:</b> {scannedRepoDetails.defaultBranch}
                                    </Col>
                                    <Col md={3}>
                                      <b>Is Private:</b> {scannedRepoDetails.isPrivate}
                                    </Col>
                                    <Col md={3}>
                                      <b>Owner:</b> {scannedRepoDetails.owner}
                                    </Col>
                                    <Col md={3}>
                                      <b>Total File Count:</b> {scannedRepoDetails.totalCount}
                                    </Col>
                                  </Col>
                                  <Col md={12}>
                                    {scannedRepoDetails.activeWebHooks.length > 0 ? (
                                     <Card>
                                      <Card.Header>Webhook Details</Card.Header>
                                      <Card.Body>
                                        {scannedRepoDetails.activeWebHooks.map(hook => (
                                          <>
                                            <Col md={12} className='d-flex mt-3'>
                                              <Col md={3}>
                                                <b>Content Type:</b> {hook.contentType}
                                              </Col>
                                              <Col md={9}>
                                                <b>Deliveries Url:</b> {hook.deliveriesUrl}
                                              </Col>
                                            </Col>
                                            
                                            <Col md={12} className='d-flex mt-3'>
                                              <Col md={6}>
                                                <b>Events:</b> {hook.events.join(',')}
                                              </Col>
                                              <Col md={6}>
                                                <b>Type:</b> {hook.type}
                                              </Col>
                                            </Col>
                                            
                                            <Col md={12} className='d-flex mt-3'>
                                              <Col md={6}>
                                                <b>Created At:</b> {hook.createdAt}
                                              </Col>
                                              <Col md={6}>
                                                <b>Updated At:</b> {hook.updatedAt}
                                              </Col>
                                            </Col>
                                          </>
                                          ))}
                                      </Card.Body>
                                     </Card>
                                    ) : (
                                      <p>No Active webhooks found</p>
                                    )}
                                  </Col>
                  
                                  {scannedRepoDetails.content?.fileName && (
                                    <Card>
                                      <Card.Header>{scannedRepoDetails.content.fileName}</Card.Header>
                                      <Card.Body dangerouslySetInnerHTML={{
                                        __html: scannedRepoDetails.content.text
                                      }}>
                                      </Card.Body>
                                    </Card>
                                  )}
                                </Row>
                              </Card.Body>
                            </Card>
                          ) : (
                            <>
                              {isScanningRepo ? <SpinnerLocal /> : (
                                <Col md={12} className='mt-3'>
                                  <Button onClick={() => setSelectedRepo(repo.name)}>Scan Repository</Button>
                                </Col>
                              )}
                            </>
                          )}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
          </Accordion>
          )}
        </Card.Body>
        )}
      </Card>
      </Container>
    </div>
  );
}

export default App;
