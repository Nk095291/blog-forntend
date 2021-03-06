import React, { useState, useEffect, Fragment, useContext } from "react";
import { Nav, Container, Table, Button, Toast, Alert } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import AuthContext from "../authContext";
import axios from "axios";
import AlertBlock from "../alertBlock";

export default function BlogsTable({ posts, isRefresh }) {
  function capitalizeFirstLetter(str) {
    let splitStr = str.toLowerCase().split(" ");
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
  }

  const { user } = useContext(AuthContext);

  const history = useHistory();

  const [displayPosts, setDisplayPosts] = useState(null);
  const [actionButton, setActionButton] = useState("pendingPosts");
  const [toastData, setToastData] = useState("test data");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setDisplayPosts(posts[actionButton]);
  }, []);

  const publishPostHandler = (postId) => {
    const url = "/posts/approve/" + postId;
    axios.post(url).then((res) => {
      setShow(true);
      setToastData(res.data.message);
      setDisplayPosts(displayPosts.filter((el) => el._id !== postId));
      isRefresh();
    });
  };

  const rejectPostHandler = (postId) => {
    const url = "/posts/reject/" + postId;
    axios.post(url).then((res) => {
      setShow(true);
      setToastData(res.data.message);
      setDisplayPosts(displayPosts.filter((el) => el._id !== postId));
      isRefresh();
    });
  };
  const deletePostHandler = (postId) => {
    const url = "/posts/my-posts/" + postId;
    axios.delete(url).then((res) => {
      setShow(true);
      setToastData(res.data.message);
      setDisplayPosts(displayPosts.filter((el) => el._id !== postId));
      isRefresh();
    });
  };

  const changeDisplayPosts = (typeOfPosts) => {
    setDisplayPosts(posts[typeOfPosts]);
    setActionButton(typeOfPosts);
  };

  if (!displayPosts) return <div>Loading...</div>;

  return (
    <Container className="mt-4">
      <AlertBlock show={show} setShow={setShow} data={toastData} />
      <Nav variant="tabs" defaultActiveKey="link-1">
        <Nav.Item>
          <Nav.Link
            onClick={() => changeDisplayPosts("pendingPosts")}
            eventKey="link-1"
          >
            Pending
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            onClick={() => changeDisplayPosts("approvedPosts")}
            eventKey="link-2"
          >
            Accepted
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            onClick={() => changeDisplayPosts("rejectedPosts")}
            eventKey="link-3"
          >
            Rejected
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th style={{ minWidth: "33vw" }}>Title</th>
            <th style={{ minWidth: "20vw" }}>Author Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {displayPosts.length
            ? displayPosts.map((post, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      history.push({
                        pathname: `/post/${post.slug}`,
                        state: { postId: post._id },
                      })
                    }
                  >
                    {capitalizeFirstLetter(post.title)}
                  </td>
                  <td>{capitalizeFirstLetter(post.author.username)}</td>
                  <td>
                    {user?.role === "admin" ? (
                      <Fragment>
                        {actionButton === "pendingPosts" ||
                        actionButton === "rejectedPosts" ? (
                          <Button
                            onClick={() => publishPostHandler(post._id)}
                            variant="primary"
                            className="mr-2"
                            size="sm"
                          >
                            Publish
                          </Button>
                        ) : null}
                        {actionButton === "pendingPosts" ||
                        actionButton === "approvedPosts" ? (
                          <Button
                            onClick={() => rejectPostHandler(post._id)}
                            variant="warning"
                            className="mr-2"
                            size="sm"
                          >
                            Reject
                          </Button>
                        ) : null}
                      </Fragment>
                    ) : (
                      <Fragment>
                        <Button
                          onClick={() => deletePostHandler(post._id)}
                          variant="danger"
                          className="mr-2"
                          size="sm"
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={() =>
                            history.push({
                              pathname: `/edit-post/${post.slug}`,
                              state: { postId: post._id },
                            })
                          }
                          variant="info"
                          size="sm"
                        >
                          Edit
                        </Button>
                      </Fragment>
                    )}
                    {post.author.role === "admin" ? (
                      <Fragment>
                        <Button
                          onClick={() =>
                            history.push({
                              pathname: `/edit-post/${post.slug}`,
                              state: { postId: post._id },
                            })
                          }
                          variant="info"
                          size="sm"
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => deletePostHandler(post._id)}
                          variant="danger"
                          className="mr-2"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </Fragment>
                    ) : null}
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </Table>
      {displayPosts.length === 0 ? (
        <div className="mt-4 text-center">
          <h4>No Post</h4>
        </div>
      ) : null}
    </Container>
  );
}
