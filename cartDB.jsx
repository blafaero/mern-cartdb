const PIDs = Array.from({length: 50}, () => Math.floor(Math.random() * 1000)).filter( (val, ind, arr) => arr.indexOf(val) === ind );

// simulate getting products from a database
const products = [
    { name: "Apples",  country: "Italy", cost: 3, instock: 10, pid: PIDs[0] },
    { name: "Oranges", country: "Spain", cost: 4, instock: 3,  pid: PIDs[1] },
    { name: "Beans",   country: "USA",   cost: 2, instock: 5,  pid: PIDs[2] },
    { name: "Cabbage", country: "USA",   cost: 1, instock: 8,  pid: PIDs[3] },
];

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

const Products = (props) => {
    const [items, setItems] = React.useState(products);
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);
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

    //  Fetch Data
    const { Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState("http://localhost:1337/api/products");
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        query,
        {
            data: [],
        }
    );
    console.log(`Rendering Products ${JSON.stringify(data)}`);

    // Fetch Data
    const addToCart = (e) => {
        let pid  = e.target.id;
        let item = items.filter((item) => item.pid == pid);
        if (item[0].instock == 0) return;
        item[0].instock = item[0].instock - 1;
        console.log(`add to Cart ${JSON.stringify(item)}`);
        setCart([...cart, ...item]);
    };

    const deleteCartItem = (delIndex) => {
        // this is the index in the cart not in the Product List

        let newCart = cart.filter((item, i) => delIndex != i);
        let target = cart.filter((item, index) => delIndex == index);
        let newItems = items.map((item, index) => {
            if (item.pid == target[0].pid) item.instock = item.instock + 1;
            return item;
        });
        setCart(newCart);
        setItems(newItems);
    };

    const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

    let list = items.map((item, index) => {
        let n = index + 1049;
        // let uhit = "http://picsum.photos/" + n;
        // note, source.unsplash is used here because it loads images faster than picsum.photos
        // it should functionally be the same as picsum.photos which is shown in the videos
        let uhit = "https://source.unsplash.com/random/800x800/?img=" + n;
      
        return (
            <li key={index} className="productspos">
                <Image src={uhit} width={70} roundedCircle alt={`img-${n}`}></Image>
                <i className="descriptionpos">
                 {item.name} (x{item.instock}): ${item.cost}

                </i>
                <Button className="bi bi-plus-square-fill myaddbut" name={item.name} id={item.pid} onClick={addToCart}></Button>
            </li>
        );
    });

                    //<Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
                    //    {item.name} (x{(cart.filter((i) => i.name == item.name)).length}) 
                    //</Accordion.Toggle>
    let cartList = cart.map((item, index) => {
        return (
            <Card key={index}>
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
                        {item.name}
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse
                    eventKey={1 + index}
                >
                    <Card.Body>
                        $ {item.cost} from {item.country}
                        <button className="mydelbut" onClick={() => deleteCartItem(index)}>
                            <i className="bi bi-x-square-fill"></i>
                        </button>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        );
    });

    let finalList = () => {
        //let total = [];
        //let total = checkOut();
        let count = {};
        let cost = {};
        let desc = {};
        let sub  = {};
        cart.forEach((item) => {
            if (count[item.pid] === undefined) {
                count[item.pid] = 1;
                cost[item.pid] = item.cost;
                desc[item.pid] = item.name + " (#" + item.pid + ")";
                sub[item.pid] = item.cost;
            } else {
                count[item.pid]++;
                sub[item.pid] = cost[item.pid] * count[item.pid];
            };
        })
        let final = Object.keys(count).map((value, index) => {
            return (
                <div key={index} index={index}>
                    {desc[value]} ${cost[value]} ...... (x{count[value]}) = ${sub[value]}
                </div>
            )
        })

        const reducer = (accum, current) => accum + current;
        let total = Object.values(sub).reduce(reducer,0); 

        //total = 

        //let final = cart.map((item, index) => {
        //    return (
        //        <div key={index} index={index}>
        //            {item.name}
        //        </div>
        //    );
        //});
        return { final, total };
    };

    const checkOut = () => {
        // Reset cart contents
        setCart([]);

        //let costs = cart.map((item) => item.cost);
        //const reducer = (accum, current) => accum + current;
        //let newTotal = costs.reduce(reducer, 0);
        //console.log(`total updated to ${newTotal}`);
        //cart.map((item, index) => deleteCartItem(index));
        //return newTotal;
    };

    const restockProducts = (url) => {
        doFetch(url);
        let newItems = data.data.map((item) => {
            let { name, country, cost, instock } = item.attributes;
            return { name, country, cost, instock };
        });

        newItems.map( (newItem) => {
            let counter = 0;
            let nomatch = true;

            items.forEach( (item, index) => {
                counter += 1;
                if ((item.name == newItem.name) && (item.country == newItem.country)) {
                    nomatch = false;

                    items[index].instock += newItem.instock;
                } else if ((counter == items.length) && nomatch) {
                    items.push({...newItem, pid:PIDs[counter]});
                }
            });
        });
        setItems([...items])
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Product List</h1>
                    <ul style={{ listStyleType: "none" }}>{list}</ul>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            restockProducts(`${query}`);
                            console.log(`Restock called on ${query}`);
                        }}
                    >
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        <button type="submit">ReStock Products</button>
                    </form>
                </Col>
                <Col>
                    <h1>Cart Contents</h1>
                    <Accordion>{cartList}</Accordion>
                </Col>
                <Col>
                    <h1>CheckOut </h1>
                    <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
                    <div> {finalList().total > 0 && finalList().final} </div>
                </Col>
            </Row>
        </Container>
    );
};

// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
