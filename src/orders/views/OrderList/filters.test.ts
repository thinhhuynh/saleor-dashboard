import { InitialOrderStateResponse } from "@dashboard/components/ConditionalFilter/API/initialState/orders/InitialOrderState";
import { TokenArray } from "@dashboard/components/ConditionalFilter/ValueProvider/TokenArray";
import { OrderListUrlFilters } from "@dashboard/orders/urls";
import { getExistingKeys } from "@test/filters";

import { getFilterVariables } from "./filters";

describe("Filtering URL params", () => {
  it("should be empty object if no params given", () => {
    // Arrange & Act
    const params: OrderListUrlFilters = {};
    const filterVariables = getFilterVariables(params, []);

    // Assert
    expect(getExistingKeys(filterVariables)).toHaveLength(0);
  });

  it("should not be empty object if params given", () => {
    // Arrange
    const params = new URLSearchParams(
      "0%5Bs2.status%5D%5B0%5D=FULFILLED&0%5Bs2.status%5D%5B1%5D=CANCELED&1=AND&2%5Bs0.customer%5D=test&3=AND&4%5Bs0.isClickAndCollect%5D=false",
    );
    const tokenizedUrl = new TokenArray(params.toString());
    const initialOrderState = InitialOrderStateResponse.empty();

    initialOrderState.status = [
      {
        label: "Fulfilled",
        slug: "FULFILLED",
        value: "FULFILLED",
      },
      {
        label: "Canceled",
        slug: "CANCELED",
        value: "CANCELED",
      },
      {
        label: "Unconfirmed",
        slug: "UNCONFIRMED",
        value: "UNCONFIRMED",
      },
    ];
    initialOrderState.isClickAndCollect = [
      {
        label: "No",
        slug: "false",
        value: "false",
      },
    ];

    // Act
    const filterVariables = getFilterVariables(
      {},
      tokenizedUrl.asFilterValuesFromResponse(initialOrderState),
    );

    // Assert
    expect(getExistingKeys(filterVariables)).toHaveLength(3);
    expect(filterVariables.customer).toBe("test");
    expect(filterVariables.status).toEqual(["FULFILLED", "CANCELED"]);
    expect(filterVariables.isClickAndCollect).toBe(false);
  });

  it("should filter by the metadata", () => {
    // Arrange
    const params = new URLSearchParams(
      "0%5Bs0.metadata%5D%5B0%5D=key1&0%5Bs0.metadata%5D%5B1%5D=value1&1=AND&2%5Bs0.metadata%5D%5B0%5D=key2&2%5Bs0.metadata%5D%5B1%5D=value2&asc=false&sort=number",
    );
    const tokenizedUrl = new TokenArray(params.toString());

    // Act
    const filterVariables = getFilterVariables(
      {},
      tokenizedUrl.asFilterValuesFromResponse(InitialOrderStateResponse.empty()),
    );

    // Assert
    expect(filterVariables.metadata).toEqual([
      { key: "key1", value: "value1" },
      { key: "key2", value: "value2" },
    ]);
  });
});
