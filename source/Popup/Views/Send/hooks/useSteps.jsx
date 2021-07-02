import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import extension from 'extensionizer';

import { LinkButton } from '@ui';
import { useRouter } from '@components/Router';
import BackIcon from '@assets/icons/back.svg';
import { setAssets } from '@redux/wallet';
import { HANDLER_TYPES, E8S_PER_ICP } from '@background/Keyring';
import Step1 from '../Steps/Step1';
import Step2a from '../Steps/Step2a';
import Step2b from '../Steps/Step2b';
import Step3 from '../Steps/Step3';
import { CURRENCIES } from '../../../../shared/constants/currencies';
import { validateAccountId, validatePrincipalId } from './utils';
import { ADDRESS_TYPES } from './constants';

const useSteps = () => {
  const [step, setStep] = useState(0);
  const { navigator } = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { assets } = useSelector((state) => state.wallet);
  const [selectedAsset, setSelectedAsset] = useState(CURRENCIES.get('ICP'));
  const [amount, setAmount] = useState(null);

  const [address, setAddress] = useState(null);
  const [addressInfo, setAddressInfo] = useState({ isValid: null, type: null });

  const [destination, setDestination] = useState('dank');

  const handleChangeAddress = (value) => setAddress(value);
  const handleChangeAddressInfo = (value) => setAddressInfo(value);
  const handleChangeAsset = (value) => setSelectedAsset(value);
  const handleChangeStep = (index) => setStep(index);
  const handleChangeAmount = (value) => setAmount(value);
  const handleChangeDestination = (value) => setDestination(value);
  const handleSendClick = () => {
    const e8s = parseInt(amount * E8S_PER_ICP, 10);
    extension.runtime.sendMessage({
      type: HANDLER_TYPES.SEND_ICP,
      params: { to: address, amount: e8s },
    }, (keyringAssets) => {
      dispatch(setAssets(keyringAssets));
      navigator.navigate('home');
    });
  };

  useEffect(() => {
    if (address !== null) {
      let isValid = validatePrincipalId(address) || validateAccountId(address);
      const type = validatePrincipalId(address) ? ADDRESS_TYPES.PRINCIPAL : ADDRESS_TYPES.ACCOUNT;
      // check for accountId if cycles selected
      if (type === ADDRESS_TYPES.ACCOUNT && selectedAsset.id === 'CYCLES') {
        isValid = false;
      }
      handleChangeAddressInfo({ isValid, type });
    }
  }, [address, selectedAsset]);

  const [primaryValue, setPrimaryValue] = useState(
    {
      prefix: '',
      suffix: ` ${selectedAsset.value}`,
      price: selectedAsset.price,
      conversionRate: 1,
    },
  );

  const [secondaryValue, setSecondaryValue] = useState(
    {
      prefix: '$',
      suffix: ' USD',
      price: 1 / selectedAsset.price,
      conversionRate: selectedAsset.price,
    },
  );
  const available = assets[0]?.amount; // Only ICP supported for now
  const [availableAmount, setAvailableAmount] = useState({
    amount: available * primaryValue.conversionRate,
    prefix: primaryValue.prefix,
    suffix: primaryValue.suffix,
  });

  useEffect(() => {
    const maxAmount = available * primaryValue.conversionRate;

    setAvailableAmount(
      {
        amount: maxAmount,
        prefix: primaryValue.prefix,
        suffix: primaryValue.suffix,
      },
    );

    if (amount > maxAmount) {
      setAmount(maxAmount);
    }
  }, [primaryValue]);

  useEffect(() => {
    setPrimaryValue(
      {
        prefix: '',
        suffix: ` ${selectedAsset.value}`,
        price: selectedAsset.price,
        conversionRate: 1,
      },
    );

    setSecondaryValue(
      {
        prefix: '$',
        suffix: ' USD',
        price: 1 / selectedAsset.price,
        conversionRate: selectedAsset.price,
      },
    );
  }, [selectedAsset]);

  useEffect(() => {
    if (!assets?.length) {
      extension.runtime.sendMessage({
        type: HANDLER_TYPES.GET_ASSETS,
        params: {},
      }, (keyringAssets) => {
        dispatch(setAssets(keyringAssets));
        setAvailableAmount(keyringAssets?.[0]?.amount);
      });
    }
  }, []);

  const handleSwapValues = () => {
    const temp = secondaryValue;
    setSecondaryValue(primaryValue);
    setPrimaryValue(temp);
  };

  // when seeing asset as USD,
  // we need to convert back the amount to the correct rate when going to review
  const convertToPrimaryAsset = () => {
    setAmount(amount / primaryValue.conversionRate);
  };

  // when coming back from review we need to view amount with the correct rate
  const convertToSecondaryAsset = () => {
    setAmount(amount * primaryValue.conversionRate);
  };

  const conversionPrice = amount / secondaryValue.price;

  const rightButton = <LinkButton value={t('common.cancel')} onClick={() => navigator.navigate('home')} />;

  const step2a = {
    component: <Step2a
      destination={destination}
      handleChangeDestination={handleChangeDestination}
      handleChangeStep={() => handleChangeStep(2)}
    />,
    left: <LinkButton value={t('common.back')} onClick={() => { convertToSecondaryAsset(); handleChangeStep(0); }} startIcon={BackIcon} />,
    right: rightButton,
    center: `${t('send.review')}`,
  };

  const step2b = {
    component: <Step2b
      handleChangeStep={() => handleChangeStep(2)}
    />,
    left: <LinkButton value={t('common.back')} onClick={() => { convertToSecondaryAsset(); handleChangeStep(0); }} startIcon={BackIcon} />,
    right: rightButton,
    center: `${t('send.warning')}`,
  };

  let step2;

  if (selectedAsset.id === 'CYCLES') {
    step2 = step2a;
  } else if (selectedAsset.id === 'ICP') {
    step2 = step2b;
  }

  const handleNextStep = () => {
    convertToPrimaryAsset();

    if (addressInfo.type === 'canister') {
      handleChangeStep(1);
    } else {
      handleChangeStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (addressInfo.type === 'canister') {
      handleChangeStep(1);
    } else {
      convertToSecondaryAsset();
      handleChangeStep(0);
    }
  };

  const steps = [
    {
      component: <Step1
        primaryValue={primaryValue}
        secondaryValue={secondaryValue}
        conversionPrice={conversionPrice}
        handleSwapValues={handleSwapValues}
        amount={amount}
        handleChangeAmount={handleChangeAmount}
        assets={Array.from(CURRENCIES.values())}
        selectedAsset={selectedAsset}
        availableAmount={availableAmount}
        handleChangeAsset={handleChangeAsset}
        address={address}
        handleChangeAddress={handleChangeAddress}
        addressInfo={addressInfo}
        handleChangeAddressInfo={handleChangeAddressInfo}
        handleChangeStep={handleNextStep}
      />,
      left: null,
      right: rightButton,
      center: t('send.title'),
    },
    {
      ...step2,
    },
    {
      component: <Step3
        asset={selectedAsset}
        amount={amount}
        address={address}
        handleSendClick={handleSendClick}
      />,
      left: <LinkButton value={t('common.back')} onClick={() => handlePreviousStep()} startIcon={BackIcon} />,
      right: rightButton,
      center: `${t('send.review')}`,
    },
  ];

  return steps[step];
};

export default useSteps;