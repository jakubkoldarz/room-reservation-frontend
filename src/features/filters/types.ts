export type FilterBase = {
    key: string;
    placeholder: string;
};

export type Filter = FilterBase &
    (
        | {
              type: "select";
              values: FilterSelectValues[];
          }
        | {
              type: "text";
          }
    );

export type FilterSelectValues = {
    value: string;
    label: string;
};
