# Table With Filter - 0.1.0

## Как это использовать?

Сперва подключите `table-with-filter.js` к своему HTML.


Затем вам надо создать таблицу `table` и указать ниже указанные аттрибуты:
- `data-smt-filter-menu-open-button` - Вам надо поставить этот атрибут к кнопке которая будет открывать меню фильтраций,
- `data-smt-field`, `type: string` - Поле с котором API будет обращаться к функциям `data-smt-get-unique-values-function`,
- `data-smt-filter-menu-target`, `type: selector` - Само меню фильтраций которая открывается при нажатий `data-smt-filter-menu-open-button`,
- `data-smt-unique-value-checkbox-target`, `type: selector` - checkbox с атрибутом `value`,
- `data-smt-unique-value-empty-checkbox-target`, `type: selector` - checkbox который должен указываться внутри HTML шаблона `data-smt-unique-value-empty-template`,
- `data-smt-unique-value-search-input-target`, `type: selector` - Надо указать `input` с которым будет искать значений в уникальных значениях,
- `data-smt-unique-value-list-target`, `type: selector` - Список в котором будет показываться уникальные значение,
- `data-smt-unique-value-select-all-button-target`, `type: selector` - Кнопка, которая будет ставить галочки на все checkbox-ы которые показаны,
- `data-smt-unique-value-reset-button-target`, `type: selector` - Кнопка, которая будет убирать галочки на всех checkbox-ах которые показаны,
- `data-smt-unique-value-template`, `type: html` - HTML шаблон с котором будет вставляться элементы в `data-smt-unique-value-list-target`, внутри этого HTML шаблона можно использовать переменную `{%unique-value%}` для вставки значение,
- `data-smt-unique-values-not-found-template`, `type: html` - HTML шаблон, который будет вставляться если ничего не найдено,
- `data-smt-unique-value-empty-template`, `type: html` - HTML шаблон, который будет показываться если в уникальных значение есть пустые значение, 
- `data-smt-unique-values-loading-template`, `type: html` - HTML шаблон, который будет показываться при загрузке уникальных значение,
- `data-smt-get-rows-function`, `type: function` - Надо указать глобальную функцию которая будет получать строки с базы данных и т.п. 
- `data-smt-get-unique-values-function`, `type: function` - Надо указать глобальную функцию которая будет получать уникальные значение для конкретного поле - `data-smt-field`.

Можно использовать эти аттрибуты на `data-smt-filter-menu-open-button`, тогда приоритет будет выше чем у таблицы.

## TODO 
- Кнопка сортировки по убыванию и по возрастанию,
- Виртуальный скролл.