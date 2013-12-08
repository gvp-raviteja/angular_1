#include<stdio.h>
#include <cstdio>
#include <math.h>
#include<iostream>
#include <cstring>
#include <sstream>
#include <time.h>
#include <algorithm>
#include <vector>
#include <map>
#include <queue>
#include <stack>
using namespace std;
#define unsync std::ios_base::sync_with_stdio(false)

int cycle_count(unsigned int k)
{
	int count=1;
	while(k!=1)
	{
		if(k%2==0)
			k=k>>1;
		else
		{
			k=3*k+1;
			k=k>>1;
			count++;
		}
		count++;
	}
	return count;
}

int main()
{

	int i,j,max=0,temp,p,q;
	unsigned int k;
	while(true)
	{
		max=0;
		cin>>i>>j;
		if (cin.fail())
            break;
		p=i;
		q=j;
		if(i>j)
		{
			temp=i;
			i=j;
			j=temp;
		}
		for(k=i;k<=j;k++)
		{
			temp=cycle_count(k);
			if(max<temp)
				max=temp;
		}
		cout<<p<<" "<<q<<" "<<max<<"\n";;
	}
	return 0;
}