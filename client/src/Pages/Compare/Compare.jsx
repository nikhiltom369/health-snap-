import { useEffect, useState } from "react";
import axios from "axios";
import { GoGitCompare } from "react-icons/go";
import { MdError } from "react-icons/md";
import styles from "./Compare.module.css";
import Loading from "../../components/Loading/Loading";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const Compare = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [errMessage, setErrMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const res = await axios.get(`${backendURL}/getcart`, {
          withCredentials: true,
        });
        setProducts(res.data.products || []);
        console.log("Fetched cart products:", res.data.products);
      } catch (error) {
        console.error("Error fetching cart products:", error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(() => {
      fetchCartProducts();
    }, 500);
  }, []);

  const toggleSelection = (id) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`${backendURL}/deletecart/${productId}`, {
        withCredentials: true,
      });

      // Update state after deletion
      setProducts((prev) =>
        prev.filter((item) => item.product._id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleCompare = () => {
    if (selected.size < 2) {
      setErrMessage("Select at least 2 products to compare.");
      return;
    }
    if (selected.size > 4) {
      setErrMessage("Maximum allowed limit is 4 products.");
      return;
    }

    const selectedProducts = products
      .filter((item) => selected.has(item.product._id))
      .map((item) => ({
        name: item.product.product_name,
        category: item.product.category,
        ingredients: item.product.ingredients,
        nutrition: item.product.nutritional_info_per100g,
      }));
    const uniqueCategories = new Set(selectedProducts.map((p) => p.category));

    if (uniqueCategories.size > 1) {
      setErrMessage("All selected products must be from the same category.");
      return;
    }

    setErrMessage("");
    console.log("Comparing products:", selectedProducts);
    const selectedProductsString = JSON.stringify(selectedProducts);
    console.log("Selected products string:", selectedProductsString);
    navigate("/cmpproducts", { state: { data: selectedProductsString } });

    // Navigate to the compare page with selected data if needed
  };

  return (
    <div className={styles.compareContainer}>
      <div className={styles.title}>
        <p>Compare Products</p>
        <GoGitCompare color="green" />
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Loading height={80} width={80} loop={true} autoplay={true} />
        </div>
      ) : (
        <div className={styles.content}>
          <p className={styles.notice}>Your added products are listed below</p>
          <div className={styles.compareBox}>
            {products.length === 0 ? (
              <div className={styles.noHistory}>
                <div className={styles.imgDiv}></div>
                <p>No products found in cart</p>
              </div>
            ) : (
              products.map((item) => (
                <div key={item.product._id} className={styles.box}>
                  <div className={styles.together}>
                    <input
                      type="checkbox"
                      className={styles.customCheck}
                      checked={selected.has(item.product._id)}
                      onChange={() => toggleSelection(item.product._id)}
                    />

                    <MdDeleteOutline
                      size={21}
                      color="red"
                      onClick={() => handleDelete(item.product._id)}
                    />
                  </div>

                  <div className={styles.historyItem}>
                    <div className={styles.prodTitle}>
                      {item.product.product_name}
                    </div>
                    <div>
                      <strong>Barcode:</strong> {item.product.barcode}
                    </div>
                    <div>
                      <strong>Brand:</strong> {item.product.brand}
                    </div>
                    <div>
                      <strong>Category:</strong> {item.product.category}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.errDiv}>
            {errMessage && (
              <p className={styles.errMessage}>
                <MdError />
                {errMessage}
              </p>
            )}
          </div>
          <button className={styles.compareButton} onClick={handleCompare}>
            Compare Products
          </button>
        </div>
      )}
    </div>
  );
};

export default Compare;
