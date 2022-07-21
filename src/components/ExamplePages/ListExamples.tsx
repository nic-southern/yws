import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { trpc } from "../../utils/trpc";

const ListExamplePage: React.FC<{}> = () => {
  const hello = trpc.useQuery(["example.getAll"]);
  return (
    <>
      <h3>Im cool</h3>
      {hello.data && (
        <ul>
          {hello.data.map((item) => (
            <li key={item.id}>{item.id}</li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ListExamplePage;
