import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

function BasicExample() {
  return (
    <Navbar
      expand="lg"
      bg="dark"
      data-bs-theme="dark"
      className="bg-body-tertiary"
    >
      <Container>
        <Navbar.Brand href="/Popularity/home">
          {/* <img
              alt=""
              src="/"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '} */}
          2025技優成果競賽 線上展覽館
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/Popularity/home">作品總覽</Nav.Link>
            <Nav.Link href="/Popularity/Tickets">我要投票</Nav.Link>
            <Nav.Link href="/Popularity/RankTable">即時排名</Nav.Link>
            <Nav.Link href="#link">使用教學</Nav.Link>
            <Nav.Link
              href="https://sites.google.com/nkust.edu.tw/2024exskex/%E9%A6%96%E9%A0%81?authuser=2"
              target="_blank"
            >
              競賽官網
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default BasicExample;
