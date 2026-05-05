"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { horizon } from "../../api/horizon";
import { usePageMetadata } from "@/context/pagemetadataContext";
import CopyIcon from "@/components/copyIcon";
import OperationText from "@/components/operationtext";
import { okx } from "../../api/okx";
import { timelib } from "../../utils/time";
import AccountLabel from "@/components/AccountLabel";
import { describePredicate, getUnlockTime } from "../../utils/predicate";
import { socialchain } from "../../api/socialchain";
import { useLanguage } from "@/context/languagecontext";
import { LabledAddress } from "../../utils/addresses";

interface AccountDetailProps {
  address: string;
}

const AccountDetail: React.FC<AccountDetailProps> = ({ address }) => {
  const { language, t } = useLanguage();
  const [accountData, setAccountData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [effects, setEffects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  //
  const [txNextLink, setTxNextLink] = useState("");
  const [txPrevLink, setTxPrevLink] = useState("");
  const [txPage, setTxPage] = useState(1);

  const [opNextLink, setOpNextLink] = useState("");
  const [opPrevLink, setOpPrevLink] = useState("");
  const [opPage, setOpPage] = useState(1);

  const [efNextLink, setEfNextLink] = useState("");
  const [efPrevLink, setEfPrevLink] = useState("");
  const [efPage, setEfPage] = useState(1);
  //
  const [piPriceUSD, setPiPriceUSD] = useState(0.0);
  //
  const { setHeading, setTitle, setDescription } = usePageMetadata();
  //
  const [claimableBalance, setClaimableBalance] = useState<any>();
  const [totalLocking, setTotalLocking] = useState(0);
  const [lockingItemCount, setLockingItemCount] = useState(0);
  const [totalClaimable, setTotalClaimable] = useState(0);
  const [nextUnlockTime, setNextUnlockTime] = useState("");
  const [claimableItemCount, setClaimableItemCount] = useState(0);
  const [isScamWarning, setIsScamWarning] = useState(false);

  useEffect(() => {
    const translatedTitle = String(t('account.title')).replace('{{address}}', address || '');
    const translatedHeading = String(t('account.heading_with_address')).replace('{{address}}', address || '');
    const translatedDescription = String(t('account.description')).replace('{{address}}', address || '');
    
    setTitle(translatedTitle);
    setHeading(translatedHeading);
    setDescription(translatedDescription);
    
    // Update metadata immediately for SEO
    document.title = translatedTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", translatedDescription);
  }, [address, setTitle, setDescription, setHeading, language, t]);

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString(language, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString(language, { 
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  const fetchPiPrice = async () => {
    try {
      okx.getMarketData().then(marketData => {
        // Market Stats
        setPiPriceUSD(parseFloat(marketData.idxPx));
      });
    } catch (error) {
      console.error("Error fetching Pi price:", error);
    }
  };

  useEffect(() => {
    fetchPiPrice();
  }, []);

  // Fetch Account detail from API
  const fetchAccountDetail = async () => {
    try {
      setLoading(true);
      if (address) {
        const response = await horizon.getAccountDetails(address);
        setAccountData(response);
        const translatedTitle = t('account.title')+address;
        setTitle(translatedTitle);
        setHeading(t('account.heading_with_address')+ address );
        setDescription(t('account.description')+ address );
      } else {
        setAccountData(null);
      }
    } catch (error: any) {
      // Only log non-400/404 errors to reduce console noise
      if (error?.response?.status !== 400 && error?.response?.status !== 404) {
        console.error("Error fetching Account detail:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch paginated tab data
  const fetchTransactions = async (Link = "", page = 1) => {
    try {
      setTabLoading(true);
      const response = await horizon.getTransactions("", Link!=""?Link:"https://api.mainnet.minepi.com/accounts/"+address+"/transactions?limit=10&order=desc");
      //if order asc, reverse the array, and next is prev and prev is next
      if (Link==""||Link.indexOf("order=desc") > 0) {
        setTransactions(response._embedded.records);
        setTxNextLink(response._links.next.href);
        setTxPrevLink(response._links.prev.href);
        setTxPage(page);
      }
      else{
        setTransactions(response._embedded.records.reverse());
        setTxNextLink(response._links.prev.href);
        setTxPrevLink(response._links.next.href);
        setTxPage(page);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchOperations = async (Link = "", page = 1) => {
    try {
      setTabLoading(true);
      const response = await horizon.getOperations("", Link!=""?Link:"https://api.mainnet.minepi.com/accounts/"+address+"/operations?limit=10&order=desc");
       //if order asc, reverse the array, and next is prev and prev is next
       if (Link==""||Link.indexOf("order=desc") > 0) {
      setOperations(response._embedded.records);
      setOpNextLink(response._links.next.href);
      setOpPrevLink(response._links.prev.href);
      setOpPage(page);
    }
    else{
      setOperations(response._embedded.records.reverse());
      setOpNextLink(response._links.prev.href);
      setOpPrevLink(response._links.next.href);
      setOpPage(page);
    }
    } catch (error) {
      console.error("Error fetching operations:", error);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchEffects = async (Link = "", page = 1) => {
    try {
      setTabLoading(true);
      const response = await horizon.getEffects(address||"", Link!=""?Link:"https://api.mainnet.minepi.com/accounts/"+address+"/effects?limit=10&order=desc");
       //if order asc, reverse the array, and next is prev and prev is next
       if (Link==""||Link.indexOf("order=desc") > 0) {
      setEffects(response._embedded.records);
      setEfNextLink(response._links.next.href);
      setEfPrevLink(response._links.prev.href);
      setEfPage(page);
    }
    else{
      setEffects(response._embedded.records.reverse());
      setEfNextLink(response._links.prev.href);
      setEfPrevLink(response._links.next.href);
      setEfPage(page);
    }
    } catch (error) {
      console.error("Error fetching effects:", error);
    } finally {
      setTabLoading(false);
    }
  };
  const fecthClaimableBalance = () => {
    try {
      horizon.getClaimableBalances(address||"").then(response=>{
        setClaimableBalance(response._embedded.records);
        //
        let locking=0;
        let lockingCount=0;
        let claimable=0;
        let nextUnlock=0;
        let claimableCount=0;
        for (let i = 0; i < response._embedded.records.length; i++) {
          const element = response._embedded.records[i];
          const claimt=element.claimants.find((c: any) => c.destination == address);
          if (claimt) {
            const unlockTime=getUnlockTime(claimt.predicate,element.last_modified_time);
            if (unlockTime>0) {
              locking+=parseFloat(element.amount);
              lockingCount++;
              if (nextUnlock==0||nextUnlock>unlockTime) {
                nextUnlock=unlockTime;
              }
            }
            else{
              claimable+=parseFloat(element.amount);
              claimableCount++;
            }
          }
        }
        setTotalLocking(locking);
        setTotalClaimable(claimable);
        setLockingItemCount(lockingCount);
        setClaimableItemCount(claimableCount);
        if (nextUnlock>0) {
          const unlockDate=new Date(Date.now() + Math.round(nextUnlock)*1000).toUTCString();
          setNextUnlockTime(unlockDate);
        }
      })
    } catch (error) {
      console.error("Error fetching claimable balance:", error);
    }
  };
    // Fetch transactions, operations, effects
    const fetchTabData = async () => {
      try {
        setTabLoading(true);
        if (address) {
         fetchTransactions("",1);
         fetchOperations("",1);
         fetchEffects("",1);
        }
      } catch (error) {
        console.error("Error fetching tab data:", error);
      } finally {
        setTabLoading(false);
      }
    };
    const fecthScamWarning = async () => {
      try {
        socialchain.checkScamWarning(address || "").then(response=>{
          if (response) {
            setIsScamWarning(true);
          }else{
            setIsScamWarning(false);
          }
        }
        )
      } catch (error) {
        console.error("Error fetching scam warning:", error);
      }
    };
    useEffect(() => {
      fecthScamWarning();
      fetchAccountDetail();
      fetchTabData();
      fecthClaimableBalance();
    }, [address]);

    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner className="mx-auto" />
          <p>{t('account.loading')}</p>
        </div>
      );
    }

    if (!accountData) {
      return <p className="text-center text-red-600">{t('account.not_found')}</p>;
    }

    return (
      <div className="">
        <h2 className="address-title long-text">
          {address} <CopyIcon textToCopy={address || ""} />
        {" "}
        {address!=null&&LabledAddress[address]!=null ? 
        <span className="badge bg-success text-light mb-3">
                        {LabledAddress[address].Logo?<><img src={LabledAddress[address].Logo} alt={LabledAddress[address].Name} className="cex-logo" width={16} /> {" "}</>:""}
                        {LabledAddress[address].Name} 
                    </span>:""}
                    </h2>
        {isScamWarning && (
          <p>
            <span className="badge bg-danger">{t('account.scam_warning_title')}</span>{" "}
            {t('account.scam_warning_description')}
          </p>
        )}
        <div className="row g-3 mb-4">
          {/* Market Stats */}
          <div className="col-md-4 text-color-normal">
            <Card>
              <CardContent>
                <h5 className="text-color-normal">{t('account.overview')}</h5>
                <div className="d-flex justify-content-between">
                  <div className="text-color-normal">
                    {t('account.available_balance')}:
                  </div>
                  <div>
                    <span className="strong-number">
                      {formatAmount(parseFloat(accountData.balances[0].balance))}π
                    </span>{" "}
                    <span className="text-muted">
                      ({formatCurrency(parseFloat(accountData.balances[0].balance) * piPriceUSD)})
                    </span>
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <div className="text-color-normal">
                    {t('account.last_modified_time')}:
                  </div>
                  <div>
                    <span className="text-muted">{timelib.timeFormat(accountData.last_modified_time, language)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-md-4">
            <Card>
              <CardContent>
                <h5 className="text-color-normal">{t('account.locking')}</h5>
                <div className="d-flex justify-content-between">
                  <div className="text-color-normal">
                    {String(t('account.total_locking')).replace('{{count}}', lockingItemCount.toString())}:
                  </div>
                  <div>
                    <span className="strong-number">{formatAmount(totalLocking)}π</span>{" "}
                    <span className="text-muted">
                      ({formatCurrency(totalLocking * piPriceUSD)})
                    </span>
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <div className="text-color-normal">
                    {t('account.next_unlock_time')}:
                  </div>
                  <div>
                    <span className="text-color-normal">
                      {nextUnlockTime !== "" ? timelib.timeFormat(nextUnlockTime, language) : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-md-4">
            <Card>
              <CardContent>
                <h5 className="text-color-normal">{t('account.claimable')}</h5>
                <div className="d-flex justify-content-between">
                  <div className="text-color-normal">
                    {t('account.amount')}:
                  </div>
                  <div>
                    <span className="strong-number">{formatAmount(totalClaimable)}π</span>{" "}
                    <span className="text-muted">
                      ({formatCurrency(totalClaimable * piPriceUSD)})
                    </span>
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <div className="text-color-normal">
                    {t('account.number_of_items')}:
                  </div>
                  <div>
                    <span className="text-color-normal">
                      {claimableItemCount == 100 
                        ? t('account.over_100_items') 
                        : formatAmount(claimableItemCount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="row g-3 mb-4 d-block d-md-none">
        {/* <AdSenseUnit/> */}
        {/* <AdUnit
                  className="67cc9f95aa72d3d47fe128c2"
                  width="300px"
                  height="100px"
                  centered={true}
                /> */}
      </div>
        <div className="white-zone">
          {/* Tabs for Transactions, Operations, Effects */}
          <Tabs defaultValue="operations" className="mt-4">
            <TabsList>
              <TabsTrigger value="operations">{t('account.tabs.operations')}</TabsTrigger>
              <TabsTrigger value="transactions">{t('account.tabs.transactions')}</TabsTrigger>
              <TabsTrigger value="effects">{t('account.tabs.effects')}</TabsTrigger>
              <TabsTrigger value="claimables">{t('account.tabs.claimable_balances')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="operations">
              {tabLoading ? (
                <div className="flex justify-center mt-3">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Table className="mt-3">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('operations.source_account')}</TableHead>
                        <TableHead>{t('operations.operation')}</TableHead>
                        <TableHead>{t('operations.amount')}</TableHead>
                        <TableHead>{t('operations.tx')}</TableHead>
                        <TableHead>{t('operations.time')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operations.map((op) => (
                        <TableRow key={op.id}>
                          <TableCell>
                            <AccountLabel account={op.source_account} shorten={true} />
                          </TableCell>
                          <TableCell><OperationText op={op} PiPrice={piPriceUSD} /></TableCell>
                          <TableCell className="font-medium">
                            {op.amount ? formatAmount(parseFloat(op.amount)) : ""}
                          </TableCell>
                          <TableCell>
                            <Link href={`/tx/${op.transaction_hash}`} className="no-underline">
                              {op.transaction_hash.slice(0, 16)}...
                            </Link>
                            {" "}
                            <CopyIcon textToCopy={op.transaction_hash} />
                          </TableCell>
                          <TableCell>{timelib.timeAgo(op.created_at, language)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => fetchOperations(opPrevLink, opPage - 1)}
                      disabled={!opPrevLink || tabLoading || opPage === 1}
                    >
                      {t('pagination.previous')}
                    </Button>
                    <span className="mx-3">{t('pagination.page')} {opPage}</span>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => fetchOperations(opNextLink, opPage + 1)}
                      disabled={!opNextLink || tabLoading}
                    >
                      {t('pagination.next')}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="transactions">
              {tabLoading ? (
                <div className="flex justify-center mt-3">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Table className="mt-3">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('account.tx_hash')}</TableHead>
                        <TableHead>{t('operations.source_account')}</TableHead>
                        <TableHead>{t('account.operation_count')}</TableHead>
                        <TableHead>{t('account.fee')}</TableHead>
                        <TableHead>{t('account.created_at')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <Link href={`/tx/${tx.id}`} className="no-underline">
                              {tx.id.slice(0, 16)}...
                            </Link>
                            {" "}
                            <CopyIcon textToCopy={tx.id} />
                          </TableCell>
                          <TableCell>
                            <AccountLabel account={tx.source_account} shorten={true} />
                          </TableCell>
                          <TableCell>{tx.operation_count}</TableCell>
                          <TableCell>{tx.fee_charged / 10_000_000} π</TableCell>
                          <TableCell>{timelib.timeAgo(tx.created_at, language)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => fetchTransactions(txPrevLink, txPage - 1)}
                      disabled={!txPrevLink || tabLoading || txPage === 1}
                    >
                      {t('pagination.previous')}
                    </Button>
                    <span className="mx-3">{t('pagination.page')} {txPage}</span>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => fetchTransactions(txNextLink, txPage + 1)}
                      disabled={!txNextLink || tabLoading}
                    >
                      {t('pagination.next')}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="effects">
              {tabLoading ? (
                <div className="flex justify-center mt-3">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Table className="mt-3">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('account.account')}</TableHead>
                        <TableHead>{t('account.effect')}</TableHead>
                        <TableHead>{t('operations.amount')}</TableHead>
                        <TableHead>{t('operations.time')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {effects.map((effect) => (
                        <TableRow key={effect.id}>
                          <TableCell>
                            <Link href={`/account/${effect.account}`} className="no-underline">
                              {effect.account.slice(0, 8)}...{effect.account.slice(-8)}
                            </Link>
                            {" "}
                            <CopyIcon textToCopy={effect.account} />
                          </TableCell>
                          <TableCell>{t(`effects.${effect.type}`) || effect.type.split("_").join(" ")}</TableCell>
                          <TableCell className="font-medium">
                            <span className={effect.type == "account_credited" ? "text-green-600" : effect.type == "account_debited" ? "text-red-600" : "text-gray-500"}>
                              {effect.type == "account_debited" ? "-" : effect.type == "account_credited" ? "+" : ""}
                              {effect.amount ? formatAmount(parseFloat(effect.amount)) : ""}
                            </span>
                          </TableCell>
                          <TableCell>{timelib.timeAgo(effect.created_at, language)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => fetchEffects(efPrevLink, efPage - 1)}
                      disabled={!efPrevLink || tabLoading || efPage === 1}
                    >
                      {t('pagination.previous')}
                    </Button>
                    <span className="mx-3">{t('pagination.page')} {efPage}</span>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => fetchEffects(efNextLink, efPage + 1)}
                      disabled={!efNextLink || tabLoading}
                    >
                      {t('pagination.next')}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="claimables">
              {tabLoading ? (
                <div className="flex justify-center mt-3">
                  <Spinner />
                </div>
              ) : (
                <>
                  <div className="mt-2">{t('account.latest_100_claimable')}</div>
                  <Table className="mt-3">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('account.sponsor')}</TableHead>
                        <TableHead>{t('operations.amount')}</TableHead>
                        <TableHead>{t('account.predicate')}</TableHead>
                        <TableHead>{t('account.create_time')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimableBalance?.map((claim: any) => (
                        <TableRow key={claim.id}>
                          <TableCell>
                            <AccountLabel account={claim.sponsor} shorten={true} />
                          </TableCell>
                          <TableCell className="font-medium">{formatAmount(parseFloat(claim.amount))}</TableCell>
                          <TableCell>{describePredicate(claim.claimants.find((c: any) => c.destination == address)?.predicate, language)}</TableCell>
                          <TableCell>{timelib.timeFormat(claim.last_modified_time, language)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
      </div>
    );
  };

  export default AccountDetail;
