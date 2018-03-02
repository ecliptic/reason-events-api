let getOrError = (~error: string, nullable: Js.Nullable.t('a)) =>
  switch (nullable |> Js.Nullable.toOption) {
  | None => Js.Exn.raiseError(error)
  | Some(results) => results
  };

let decodeDate = MomentRe.((date: string) => moment(date) |> Moment.toDate);
