## Bonus: Data Model Diagram

```mermaid
erDiagram
	CATEGORY ||--o{ PRODUCT : contains

	CATEGORY {
		ObjectId _id PK
		string name
		string description
		date createdAt
		date updatedAt
	}

	PRODUCT {
		ObjectId _id PK
		string name
		string description
		number price
		number discount
		string image
		string status
		string productCode UNIQUE
		ObjectId categoryId FK
		date createdAt
		date updatedAt
	}
```

- One category can have many products.
- Each product belongs to exactly one category.
- productCode is unique.
