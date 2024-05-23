import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import axios from 'axios';
import { ColumnType } from 'antd/es/table';
import SalaryLineChart from './SalaryLineChart';

interface SalaryData {
  work_year: number;
  salary_in_usd: number;
  job_title: string;
}

interface AggregatedData {
  year: number;
  totalJobs: number;
  averageSalary: number;
}

const App: React.FC = () => {
  const [data, setData] = useState<SalaryData[]>([]);
  const [tableData, setTableData] = useState<AggregatedData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    axios.get('/salaries.csv').then((response) => {
      const rows = response.data.split('\n').slice(1);
      const parsedData: SalaryData[] = rows.map((row: string) => {
        const cols = row.split(',');
        return {
          work_year: parseInt(cols[0], 10),
          salary_in_usd: parseFloat(cols[6]),
          job_title: cols[3],
        };
      });
      setData(parsedData);

      const aggregatedData = parsedData.reduce((acc: Record<number, AggregatedData>, curr: SalaryData) => {
        if (!acc[curr.work_year]) {
          acc[curr.work_year] = { year: curr.work_year, totalJobs: 0, averageSalary: 0 };
        }
        acc[curr.work_year].totalJobs += 1;
        acc[curr.work_year].averageSalary += curr.salary_in_usd;
        return acc;
      }, {});

      const result: AggregatedData[] = Object.values(aggregatedData).map((item) => ({
        year: item.year,
        totalJobs: item.totalJobs,
        averageSalary: item.averageSalary / item.totalJobs,
      }));

      setTableData(result);
    });
  }, []);

  const columns: ColumnType<AggregatedData>[] = [
    { title: 'Year', dataIndex: 'year', sorter: (a, b) => a.year - b.year },
    { title: 'Total Jobs', dataIndex: 'totalJobs', sorter: (a, b) => a.totalJobs - b.totalJobs },
    { title: 'Average Salary (USD)', dataIndex: 'averageSalary', sorter: (a, b) => a.averageSalary - b.averageSalary },
  ];

  const onRowClick = (record: AggregatedData) => {
    setSelectedYear(record.year);
  };

  return (
    <div>
      <SalaryLineChart data={tableData} />
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="year"
        onRow={(record) => ({
          onClick: () => onRowClick(record),
        })}
      />
      {selectedYear && <DetailTable year={selectedYear} data={data} />}
    </div>
  );
};

interface DetailTableProps {
  year: number;
  data: SalaryData[];
}

const DetailTable: React.FC<DetailTableProps> = ({ year, data }) => {
  const filteredData = data.filter((item) => item.work_year === year);
  const aggregatedJobData = filteredData.reduce((acc: Record<string, number>, curr: SalaryData) => {
    if (!acc[curr.job_title]) {
      acc[curr.job_title] = 0;
    }
    acc[curr.job_title] += 1;
    return acc;
  }, {});

  const jobData = Object.entries(aggregatedJobData).map(([jobTitle, count]) => ({
    jobTitle,
    count,
  }));

  const columns: ColumnType<{ jobTitle: string; count: number }>[] = [
    { title: 'Job Title', dataIndex: 'jobTitle' },
    { title: 'Count', dataIndex: 'count' },
  ];

  return (
    <Table
      dataSource={jobData}
      columns={columns}
      rowKey="jobTitle"
      title={() => `Job Titles for Year ${year}`}
    />
  );
};

export default App;
