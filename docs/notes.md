# Data Models
> Data model to store the instrument data in the vuex store.

````javascript
{
  id: 1,
  institution: 'Umwelttechnologieförderung',
  instrument: 'Flankierende Massnahmen',
  regionId: 1,
  categoryIds: [2,3],
  from: 3.1,
  to: 5.2,
  budget: {
    total: 4000000,
    items: [
      {
        categoryIds: [2],
        amount: 3000000
      },
      {
        categoryIds: [3],
        amount: 1000000
      }
    ]
  }
}
````

#### Instrumenten Objekt
| key | description | type |
| --- | --- | --- |
| `id` | Eindeutige ID | integer |
| `institution` | Institution des Förderinstruments | string |
| `instrument` | Förderinstrument | string |
| `regionId` | ID der Region | integer |
| `categoryIds` | IDs der Kategorien | integer [] |
| `from` | Start Phase mit Kommazahlen | float |
| `to` | Schluss Phase mit Kommazahlen | float |
| `budget` | Budget Objekt | object |

#### Budget Objekt
| key | description | type |
| --- | --- | --- |
| `total` | Total Förderbetrag | integer |
| `items` | Budgetposten Objekte | object [] |

#### Budget Item Objekt
| key | description | type |
| --- | --- | --- |
| `categoryIds` | IDs der Kategorien  | integer [] |
| `amount` | Budgetbetrag | integer |
