import { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRepositoryByName, getRepositoryList, scanAllRepo } from './api.service';
import { Accordion, Row, Col, Container, Card, Spinner, Button, Form } from 'react-bootstrap';

function App() {
  const [repoList, setRepoList] = useState([]);
  const [isGraphQlQuery, setIsGraphQlQuery] = useState(true);
  const [scanAllRepoData, setScanAllRepoData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(undefined);
  const [scannedRepoDetails, setScannedRepoDetails] = useState(undefined);
  const [isScanningRepo, setIsScanningRepo] = useState(false);
  const [listView, setListView] = useState(false);
  const [allScanView, setAllScanView] = useState(false);

  const selectListView = () => {
    setIsLoading(true);
    getRepositoryList(isGraphQlQuery).then(resp => {
      const { getRepositories } = resp;
      setListView(true);
      setAllScanView(false);
      setRepoList(getRepositories);
    }).finally(() => setIsLoading(false))
  }

  const selectAllScanView = () => {
    setIsLoading(true);
    scanAllRepo(isGraphQlQuery).then(resp => {
      const { scanAllRepository } = resp;
      setListView(false);
      setAllScanView(true);
      setScanAllRepoData(scanAllRepository);
    }).finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if(!selectedRepo) return;
    setIsScanningRepo(true);
    getRepositoryByName(selectedRepo, isGraphQlQuery).then(resp => {
      const { scanRepository } = resp;
      setScannedRepoDetails(scanRepository ? scanRepository : {});
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

  const ListAllReposView = () => {
    if(!listView) {
      return <></>
    }
    return (
      <Card.Body>
        {repoList.length === 0 ? 'No Repos found' : (
            <Accordion key={'all-list'} className={isScanningRepo ? 'disabled': ''} onSelect={(name) => {
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
                            <>
                              {Object.keys(scannedRepoDetails).length === 0 ? (
                                <Card>
                                    <Card.Header>Not Able to fetch repo details</Card.Header>
                                </Card>
                              ) : (
                                <Card>
                                <Card.Header>Scan Details</Card.Header>
                                <Card.Body>
                                  <Row>
                                    <Col md={12} className='d-flex'>
                                      <Col md={3}>
                                        <b>Default Branch:</b> {scannedRepoDetails.defaultBranch}
                                      </Col>
                                      <Col md={3}>
                                        <b>Is Private:</b> {scannedRepoDetails.isPrivate.toString()}
                                      </Col>
                                      <Col md={3}>
                                        <b>Owner:</b> {scannedRepoDetails.owner}
                                      </Col>
                                      <Col md={3}>
                                        <b>Total File Count:</b> {scannedRepoDetails.totalCount}
                                      </Col>
                                    </Col>
                                    <Col md={12}>
                                      {scannedRepoDetails.activeWebHooks ? (
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
                              )}
                            </>
                          ) : (
                            <>
                              {isScanningRepo ? <SpinnerLocal /> : (
                                <Col md={12} className='mt-3'>
                                  <Button onClick={e => setSelectedRepo(repo.name)}>Scan Repository</Button>
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
    );
  }

  const AllScanView = () => {
    if(!allScanView) {
      return <></>
    }
    return (
      <Card.Body>
        {scanAllRepoData.length === 0 ? 'No Repos found' : (
            <Accordion key={'scan-view'} alwaysOpen={true}>
              {scanAllRepoData.map((scannedRepo, i) => (
                <Accordion.Item key={i}>
                  <Accordion.Header>{scannedRepo.name}</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={12} className='d-flex'>
                        <Col md={4}>
                          <b>Owner:</b> {scannedRepo.nameWithOwner}
                        </Col>
                        <Col md={4}>
                          <b>Disk Usage:</b> {scannedRepo.diskUsage}
                        </Col>
                        <Col md={4}>
                          <b>Created On:</b> {scannedRepo.createdAt}
                        </Col>
                      </Col>
                      {scannedRepo.scanDetails ? (
                           
                           <Card>
                           <Card.Header>Scan Details</Card.Header>
                           <Card.Body>
                             <Row>
                               <Col md={12} className='d-flex'>
                                 <Col md={3}>
                                   <b>Default Branch:</b> {scannedRepo.scanDetails.defaultBranch}
                                 </Col>
                                 <Col md={3}>
                                   <b>Is Private:</b> {scannedRepo.scanDetails.isPrivate.toString()}
                                 </Col>
                                 <Col md={3}>
                                   <b>Owner:</b> {scannedRepo.scanDetails.owner}
                                 </Col>
                                 <Col md={3}>
                                   <b>Total File Count:</b> {scannedRepo.scanDetails.totalCount}
                                 </Col>
                               </Col>
                               <Col md={12}>
                                 {scannedRepo.scanDetails.activeWebHooks ? (
                                  <Card>
                                   <Card.Header>Webhook Details</Card.Header>
                                   <Card.Body>
                                     {scannedRepo.scanDetails.activeWebHooks.map(hook => (
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
               
                               {scannedRepo.scanDetails.content?.fileName && (
                                 <Card>
                                   <Card.Header>{scannedRepo.scanDetails.content.fileName}</Card.Header>
                                   <Card.Body dangerouslySetInnerHTML={{
                                     __html: scannedRepo.scanDetails.content.text
                                   }}>
                                   </Card.Body>
                                 </Card>
                               )}
                             </Row>
                           </Card.Body>
                         </Card>
                         
                          ) : (
                            <Card>
                              <Card.Header>Not Able to fetch repo details</Card.Header>
                            </Card>
                          )}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
          </Accordion>
          )}
        </Card.Body>
    );
  }

  return (
    <div className="App">
      <Container>
      <Card >
          <Card.Header>
            <Row className='d-flex'>
              <Col md={8}>
                <h3>Repo Connector</h3>
              </Col>
              <Col className='d-flex' md={4}>
                <Col>
                  <p className='mt-2'><b>Chosse Query Method: </b></p>
                </Col>
                <Col>
                  <Form.Select onChange={e => setIsGraphQlQuery(e.target.value === '1')} defaultValue={"1"}>
                    <option>Choose Query Method</option>
                    <option value="1">Graph Ql</option>
                    <option value="2">Rest API</option>
                  </Form.Select>
                </Col>
              </Col>
            </Row>
            <Row className='mt-4 mb-4'>
              <Col md={12} className='d-flex'>
                <Col></Col>
                <Col>
                  <Button variant="primary" size="lg" disabled={listView} onClick={selectListView}>
                    List Repositories
                  </Button>
                </Col>
                <Col>
                  <Button variant="primary" size="lg" disabled={allScanView} onClick={selectAllScanView}>
                    Scan Repositories
                  </Button>
                </Col>
                <Col></Col>
              </Col>
            </Row>
          </Card.Header>
          {isLoading ? <SpinnerLocal /> : (
            <>
              <ListAllReposView />
              <AllScanView />
            </>
        )}
      </Card>
      </Container>
    </div>
  );
}

export default App;
