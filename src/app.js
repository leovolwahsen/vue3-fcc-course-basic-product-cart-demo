let app = Vue.createApp({
    data() {
      return {
        showSidebar: false,
        inventory: [],
        cart: {},
      };
    },
    computed: {
      totalQuantity() {
        return Object.values(this.cart).reduce((acc, curr) => {
          return acc + curr
        }, 0)
      }
    },
    methods: {
      addToCart(name, index) {
        if (!this.cart[name]) this.cart[name] = 0;
        this.cart[name] += this.inventory[index].quantity;
        this.inventory[index].quantity = 0;
      },
      toggleSidebar() {
        this.showSidebar = !this.showSidebar;
      },
      removeItem(name) {
        delete this.cart[name];
      },
    },
    async mounted() {
      try {
        const res = await fetch("./food.json");
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        this.inventory = data;
      } catch (error) {
        console.error("Error", error);
      }
    },
  });

  // By adding this: props: ["toggle"] it is possible to reference the following:
  // :toggle="toggleSidebar" so that i can close by clicking X icon
  app.component("sidebar", {
    props: ["toggle", "cart", "inventory", "remove"],
    methods: {
      getPrice(name) {
        const product = this.inventory.find((p) => {
          return p.name === name;
        });
        return product.price.USD.toFixed(2);
      },
      calculateTotalCost() {
        // I generate here a array of [key, value]
        // I set default value 0 for Total
        const total = Object.entries(this.cart).reduce(
          (acc, curr, index) => {
            return acc + curr[1] * this.getPrice(curr[0]);
          },
          0
        );
        return total.toFixed(2);
      },
    },

    template: `
      <aside class="cart-container">
      <div class="cart">
        <h1 class="cart-title spread">
          <span>
            Cart
            <i class="icofont-cart-alt icofont-1x"></i>
          </span>
          <button @click="toggle" class="cart-close">&times;</button>
        </h1>

        <div class="cart-body">
          <table class="cart-table">
            <thead>
              <tr>
                <th><span class="sr-only">Product Image</span></th>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(quantity, key, i) in cart" :key="i" >
                <td><i class="icofont-carrot icofont-3x"></i></td>
                <td class="center">{{ key }}</td>
                <td class="center">\${{ getPrice(key) }}</td>
                <td class="center">{{ quantity }}</td>
                <td class="center">
                  \${{ (quantity * getPrice(key)).toFixed(2) }}
                </td>
                <td class="center">
                  <button 
                    @click="remove(key)"
                    class="btn btn-light cart-remove"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p 
            v-if="!Object.keys(cart).length"
            class="center"
          ><em>No items in cart</em></p>
          <div class="spread">
            <span>
              <strong>
                Total:
              </strong>
              \${{ calculateTotalCost() }}
            </span>
            <button 
              class="btn btn-light"
            >Checkout</button>
          </div>
        </div>
      </div>
    </aside>
    `,
  });

  app.mount("#app");