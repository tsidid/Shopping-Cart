//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const {
  Card,
  Accordion,
  Button,
  Container,
  Row,
  Col,
  Image,
  Input,
} = ReactBootstrap;
const { Fragment, useState, useEffect, useReducer } = React;


const Products = () => {
  const [items, setItems] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  //  Fetch Data

  const [query, setQuery] = useState("http://localhost:1337/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/products",
    {
      data: [],
    }
  );


  //check for updated items list
  useEffect(() => {
    console.log(`items state updated to: ${JSON.stringify(items)}`);
  }, [items]);

  // console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data

  //add to cart function subtracts item from item instock state
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    console.log(`add to Cart ${JSON.stringify(item)}`);
    let updatedItems = items.map((item) => {
      if(e.target.name === item.name) {
        item.instock = item.instock - 1;
      }
      return item;
    });
    console.log(JSON.stringify(updatedItems));
    setCart([...cart, ...item]);
    //doFetch(query);
  };

  //delete items from cart; adds back to item instock
  const deleteCartItem = (index) => {
    let productName = cart[index].name;
    let updatedProducts = [...items]; 
    updatedProducts.forEach((item) => {
      if(productName === item.name){
        item.instock = item.instock + 1;
      }
    });
    console.log(updatedProducts);
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };



  let list = items.map((item, index) => {
    let n = index + 1049;
    let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={url} width={50} roundedCircle></Image>
        <Button variant="primary" size="large" type="submit" name={item.name} onClick={addToCart}>
          {item.name}: ${item.cost} <br />
          Current Stock: {item.instock}
        </Button>
      </li>
    );
  });

  let deleteIcon = <img src="./trash.png" alt="trash icon" id="deleteIcon" />

  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Item as={Button} variant="link" eventKey={1 + index} onClick={() => deleteCartItem(index)}>
            {deleteIcon}
          </Accordion.Item>
        </Card.Header>
        <Card.Body>
          {item.name} <br />
          ${item.cost} from {item.country}
        </Card.Body>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.map((item) => {
      let { name, country, cost, instock } = item;
      return { name, country, cost, instock };
    });
    setItems([...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut ${finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));